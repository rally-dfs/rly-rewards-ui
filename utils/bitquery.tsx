import { createApolloClient, queryApollo } from "./solanaApollo";

const bitqueryApolloClient = createApolloClient(
  "https://graphql.bitquery.io/",
  {
    "X-API-KEY": process.env.BITQUERY_API_KEY,
    "Content-Type": "application/json",
  }
);

// wait 10 seconds between API calls (this can probably be reduced if we pay for a better plan)
const TIMEOUT_BETWEEN_CALLS = 10000;

type BitquerySolanaTransfer = {
  amount: number;
  transferType: string; // i think this is always "transfer"?
  transaction: BitquerySolanaTransferTransaction;
  sender: BitquerySolanaTransferAccount;
  receiver: BitquerySolanaTransferAccount;
};
type BitquerySolanaTransferTransaction = {
  signature: string;
};
type BitquerySolanaTransferAccount = {
  address: string;
  mintAccount: string;
  type: string; // i think this is always "account"?
};

// Helper for tokenAccountBalanceOnDateBitquery, just so we can reuse the code for two different filters
// `tokenAccountOwnerFilter` is either "senderAddress: {is: $tokenAccountOwnerAddress}" or
// "receiverAddress: {is: $tokenAccountOwnerAddress}" or null (if no filter needed)
async function _transferAmountsWithFilter(
  tokenMintAddress: string,
  startDate: Date,
  endDate: Date,
  tokenAccountOwnerFilter?: string,
  tokenAccountOwnerAddress?: string
) {
  // TODO: might be safer if we pass in a set of previous txn IDs or something too to prevent under/double counting

  const pageLimit = 2500;
  const maxOffset = pageLimit * 1000000; // infinite loop protection

  let allTransfers: Array<BitquerySolanaTransfer> = [];

  let offset = 0;
  let hasMorePages = true;

  while (hasMorePages && offset < maxOffset) {
    console.log("fetching offset", offset);

    // make sure to only include the gql variable if we have a filter
    const tokenAccountOwnerFilterString = tokenAccountOwnerFilter
      ? tokenAccountOwnerFilter
      : "";
    const tokenAccountOwnerVariableString = tokenAccountOwnerFilter
      ? "$tokenAccountOwnerAddress: String!,"
      : "";

    const { data } = await queryApollo(
      bitqueryApolloClient,
      `query TransfersForSenderAndToken(
            $startTime: ISO8601DateTime!, $endTime: ISO8601DateTime!, 
            $tokenMintAddress: String!,
            ${tokenAccountOwnerVariableString}
            $limit: Int!, $offset: Int!) {
          solana {
            transfers(
              options: {limit: $limit, offset: $offset}
              time: {between: [$startTime, $endTime]}
              currency: {is: $tokenMintAddress}
              ${tokenAccountOwnerFilterString}
            ) {
              amount
              transferType
              transaction {
                signature
              }
              sender {
                address
                mintAccount
                type
              }
              receiver {
                address
                mintAccount
                type
              }
            }
          }
        }  
        `,
      {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        tokenMintAddress: tokenMintAddress,
        tokenAccountOwnerAddress: tokenAccountOwnerAddress,
        limit: pageLimit,
        offset: offset,
      }
    );

    // console.log("data", data, data["solana"]["transfers"]);

    const transfers: Array<BitquerySolanaTransfer> =
      data["solana"]["transfers"];

    allTransfers = allTransfers.concat(transfers);

    hasMorePages = transfers.length == pageLimit;
    offset += pageLimit;

    // rate limiting here in case we make too many calls
    await new Promise((f) => setTimeout(f, TIMEOUT_BETWEEN_CALLS));
  }

  return allTransfers;
}

// Queries bitquery solana.transfers for `ownerAddress` with an end date of `date`
// Since solana.transfers doesn't have any balances, we must add up all the transfers between previousDate and date
export async function tokenAccountBalanceOnDateBitquery(
  tokenAccountAddress: string,
  tokenAccountOwnerAddress: string,
  tokenMintAddress: string,
  date: Date,
  previousBalance: number,
  previousDate: Date
) {
  const transfersOut: Array<BitquerySolanaTransfer> =
    await _transferAmountsWithFilter(
      tokenMintAddress,
      previousDate,
      date,
      "senderAddress: {is: $tokenAccountOwnerAddress}",
      tokenAccountOwnerAddress
    );

  const filteredTransfersOut = transfersOut.filter((transfer) => {
    return (
      // not sure what other transferTypes exist but seems safe to filter by "transfer"
      transfer.transferType === "transfer" &&
      // this owner might have other token accounts so filter those out
      transfer.sender.mintAccount == tokenAccountAddress
    );
  });
  const totalTransfersOut = filteredTransfersOut.reduce(
    (accumulator, currentTransfer) => {
      return accumulator + currentTransfer.amount;
    },
    0
  );


  // same as transfersOut but filter by `receiverAddress` instead of `senderAddress`
  const transfersIn: Array<BitquerySolanaTransfer> =
    await _transferAmountsWithFilter(
      tokenMintAddress,
      previousDate,
      date,
      "receiverAddress: {is: $tokenAccountOwnerAddress}",
      tokenAccountOwnerAddress
    );

  // same as totalTransfersOut but filter by `transfer.receiver` instead of `transfer.sender`
  const filteredTransfersIn = transfersIn.filter((transfer) => {
    return (
      // not sure what other transferTypes exist but seems safe to filter by "transfer"
      transfer.transferType === "transfer" &&
      // this owner might have other token accounts so filter those out
      transfer.receiver.mintAccount == tokenAccountAddress
    );
  });
  const totalTransfersIn = filteredTransfersIn.reduce(
    (accumulator, currentTransfer) => {
      return accumulator + currentTransfer.amount;
    },
    0
  );

  console.log(
    "bitquery tsf out",
    totalTransfersOut,
    "in",
    totalTransfersIn,
    "new bal",
    previousBalance + totalTransfersIn - totalTransfersOut
  );

  return previousBalance + totalTransfersIn - totalTransfersOut;
}

export type BitqueryTokenBalance = {
  date: Date;
  balance: number;
};

// Calls tokenAccountBalanceOnDateBitquery for all balances between startDate and endDate.
// Currently just returns an array of SolanaFMTokenBalance but this probably will eventually be called to backfill
// all the dates for a token in the DB or something.
export async function getAllTokenBalancesBetweenDatesBitquery(
  tokenAccountAddress: string,
  tokenAccountOwnerAddress: string,
  tokenMintAddress: string,
  startDate: Date,
  endDate: Date,
  // If fullLoadZeroBalanceDate is set, then we assume 0 balance on that date (i.e. assume this is the earliest date
  // there was any activity in this account) and do a full load for every date. Otherwise it just uses the previously
  // fetched data (which probably matches what we'd do in real life if we ran this every day in a cron).
  // TODO: This shouldn't be needed for anything/can be removed since it's just doing the same thing with more API calls,
  // but just using it for testing the API for now and making sure there's no weird double counting etc if we accumulate
  // results vs a full load).
  fullLoadZeroBalanceDate?: Date
) {
  let allBalances: Array<BitqueryTokenBalance> = [];

  // 0 + a date assumes the all activity happened after that date
  let previousBalance = 0;
  // Dec 2021 was when sRLY was minted, probably an okay default
  let previousDate =
    fullLoadZeroBalanceDate || new Date("2021-12-19T00:00:00Z");

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    console.log(
      "fetching date",
      currentDate,
      "prev date bal",
      previousDate,
      previousBalance
    );

    let balance = await tokenAccountBalanceOnDateBitquery(
      tokenAccountAddress,
      tokenAccountOwnerAddress,
      tokenMintAddress,
      currentDate,
      previousBalance,
      previousDate
    );

    console.log(currentDate, "balance = ", balance);

    allBalances.push({ date: currentDate, balance: balance });

    // only reset these if we aren't forcing a full load
    if (fullLoadZeroBalanceDate === undefined) {
      previousDate = new Date(currentDate);
      previousBalance = balance;
    }

    currentDate = new Date(currentDate.valueOf() + 86400000); // this doesn't work if we need a DST timezone like PST/PDT

    // rate limiting in case we make too many calls
    await new Promise((f) => setTimeout(f, TIMEOUT_BETWEEN_CALLS));
  }

  console.log("balances", allBalances);

  return allBalances;
}

export type BitqueryTokenAccountInfo = {
  tokenAccountAddress: string;
  balanceChange: number;
  incomingTransactions: Set<string>;
  outgoingTransactions: Set<string>;
};

// Queries bitquery solana.transfers for all token accounts belonging to `tokenMintAddress` with any activity between
// `startDate` and `endDate`
// Returns a list of BitqueryTokenAccountInfo (i.e. this would probably be used to see which new accounts were
// created that day and for updating balance/txn count for any previous accounts against some running db list)
// Note this interface is slightly different than tokenAccountsInfoBetweenDatesSolanaFm. Since bitquery
// solana.transfers doesn't have any balances, we return the change in balance between startDate and endDate rather
// than the final balance (so this must be combined with some previous call's balance or called multiple times)
export async function tokenAccountsInfoBetweenDatesBitquery(
  tokenMintAddress: string,
  startDate: Date,
  endDate: Date
) {
  let results = await _transferAmountsWithFilter(
    tokenMintAddress,
    startDate,
    endDate,
    undefined,
    undefined
  );

  let accountInfoMap: { [key: string]: BitqueryTokenAccountInfo } = {};

  results.forEach((result) => {
    // TODO: currently ignoring "mint" "burn" and "self" (think this is when the same owner transfers
    // transfers to themselves or something) but could count them too
    if (result.transferType !== "transfer") {
      return;
    }

    if (accountInfoMap[result.sender.mintAccount] === undefined) {
      accountInfoMap[result.sender.mintAccount] = {
        tokenAccountAddress: result.sender.mintAccount,
        balanceChange: 0,
        incomingTransactions: new Set<string>(),
        outgoingTransactions: new Set<string>(),
      };
    }

    if (accountInfoMap[result.receiver.mintAccount] === undefined) {
      accountInfoMap[result.receiver.mintAccount] = {
        tokenAccountAddress: result.receiver.mintAccount,
        balanceChange: 0,
        incomingTransactions: new Set<string>(),
        outgoingTransactions: new Set<string>(),
      };
    }

    accountInfoMap[result.sender.mintAccount].balanceChange -= result.amount;
    accountInfoMap[result.receiver.mintAccount].balanceChange += result.amount;

    accountInfoMap[result.sender.mintAccount].outgoingTransactions.add(
      result.transaction.signature
    );
    accountInfoMap[result.receiver.mintAccount].incomingTransactions.add(
      result.transaction.signature
    );
  });

  console.log(results.length, " results");

  // TODO: we're ignoring closed accounts right now, in the future we could take it into account somehow (e.g. manually
  // reduce the number of "total accounts")

  return Object.values(accountInfoMap);
}
