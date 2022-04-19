type SolanaFMAccountInput = {
  transactionHash: string;
  account: string;
  tokenId: string;
  preBalance: number;
  postBalance: number;
  timestamp: string;
};

// exponential backoff starts at 10 minutes and increases by 10x every iteration
const START_TIME_DELTA = 60 * 1000;
const EXPONENTIAL_FACTOR = 10;

// wait 10 seconds between API calls
// sfm is super aggressive with rate limits, seems once you go over they just freeze the account forever (can't figure
// out how to unfreeze, just had to make a new one). probably not intentional but good to be very conservative here.
const TIMEOUT_BETWEEN_CALLS = 10000;

async function _fetchAllAccountInputsWithUrlAndDates(
  url: URL,
  startDate: Date,
  endDate: Date
) {
  const pageLimit = 100;

  const requestHeaders = new Headers([
    ["Content-Type", "application/json"],
    ["apikey", process.env.SOLANA_FM_API_KEY || ""],
  ]);

  const params = new URLSearchParams([["limit", pageLimit.toString()]]);

  console.log("start", startDate, "end", endDate);
  params.set("from", startDate.toISOString());
  params.set("to", endDate.toISOString());
  url.search = params.toString();

  let response = await fetch(url.toString(), { headers: requestHeaders });

  let results;
  let responseText;
  try {
    responseText = await response.text();
    results = JSON.parse(responseText);
  } catch (error) {
    console.log("JSON error", responseText, error);
    return undefined;
  }

  let allResults: Array<SolanaFMAccountInput> = [];
  allResults = allResults.concat(results);

  // results are in random order so even for token balance (where we only care about the most recent account-input), we
  // still need to get every single page and then find the most recent account-input.
  let page = 2;
  let maxPages = 1000000; // infinite loop protection
  while (results.length == pageLimit && page < maxPages) {
    console.log("fetching page", page);

    params.set("page", page.toString());
    url.search = params.toString();

    response = await fetch(url.toString(), { headers: requestHeaders });

    try {
      responseText = await response.text();
      results = JSON.parse(responseText);
    } catch (error) {
      console.log("JSON error", responseText, error);
      return undefined;
    }

    // console.log(url.toString(), ", response", response, results);

    allResults = allResults.concat(results);

    page += 1;

    // rate limiting here in case we make too many calls
    await new Promise((f) => setTimeout(f, TIMEOUT_BETWEEN_CALLS));
  }

  return allResults;
}

// Queries solana.fm account-inputs for the balance of `tokenAccountAddress` (which must belong to `tokenMintAddress`)
// with an end date of `date`
// Uses exponentially larger time windows until we find the most recent transaction and then read `postBalance` from that
// If previousBalance and previousDate are cached (e.g. from a previous call) and passed in, then we stop there and
// return those values if nothing is found (can also use it to pass in 0 and a min startDate to limit the search)
// https://docs.solana.fm/docs/apis/account-input#retrieve-account-inputs-by-a-specific-account
export async function tokenAccountBalanceOnDateSolanaFm(
  tokenAccountAddress: string,
  tokenMintAddress: string,
  date: Date,
  previousBalance: number,
  previousDate: Date
) {
  const url = new URL(
    `https://api-alpha.solana.fm/api/v1/account-inputs/${tokenAccountAddress}`
  );

  let delta = START_TIME_DELTA;
  let startDate = new Date(date.getTime() - delta);

  // this won't ever infinite loop, eventually we'll pass previousDate and return
  while (true) {
    // console.log(url.toString(), ", response", response, results);

    let results = await _fetchAllAccountInputsWithUrlAndDates(
      url,
      startDate,
      date
    );

    if (results === undefined) {
      // TODO: handle error here
      return undefined;
    }

    // found some results, get the most recent one
    if (results.length > 0) {
      // now look through allResults and pick out the most recent result
      let max = results.reduce((previous, current) => {
        // returns both the token inputs and tokenId == '' for lamports, so need to ignore the latter
        if (current.tokenId !== tokenMintAddress) {
          return previous;
        }
        return new Date(previous.timestamp) > new Date(current.timestamp)
          ? previous
          : current;
      });

      // console.log("Max from solana.fm", max);

      // TODO: could probably put in a sanity check alert here, in theory they should all be the same balance
      let sameTimeAsMax = results.filter((value) => {
        return (
          value.timestamp == max.timestamp &&
          value.postBalance != max.postBalance
        );
      });

      // console.log("All results with same timestamp as max", sameTimeAsMax);

      // TODO: this is in display units, not base units :(, maybe can keep using this as a sanity check though
      return max.postBalance;
    }

    // didn't find any results between previousDate and date so just return previousBalance
    if (startDate < previousDate) {
      return previousBalance;
    }

    // didn't find any results but there's still more time to check, so loop again
    delta *= EXPONENTIAL_FACTOR;
    startDate = new Date(date.getTime() - delta);

    // rate limiting here in case we make too many calls
    await new Promise((f) => setTimeout(f, TIMEOUT_BETWEEN_CALLS));
  }
}

export type SolanaFMTokenBalance = {
  date: Date;
  balance: number;
};

// Calls tokenAccountBalanceOnDateSolanaFm for all balances between startDate and endDate.
// Currently just returns an array of SolanaFMTokenBalance but this probably will eventually be called to backfill
// all the dates for a token in the DB or something.
export async function getAllTokenBalancesBetweenDatesSolanaFm(
  tokenAccountAddress: string,
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
  let allBalances: Array<SolanaFMTokenBalance> = [];

  // 0 + a date assumes the all activity happened after that date
  let previousBalance = 0;
  // TODO: this is just placeholder, should replace it with something older, e.g. Dec 2021 was when sRLY was minted.
  let previousDate =
    fullLoadZeroBalanceDate || new Date("2022-01-31T00:00:00Z");

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    console.log("fetching date", currentDate);

    let balance = await tokenAccountBalanceOnDateSolanaFm(
      tokenAccountAddress,
      tokenMintAddress,
      currentDate,
      previousBalance,
      previousDate
    );

    if (balance === undefined) {
      // TODO: log error
      continue;
    }

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

export type SolanaFMTokenAccountInfo = {
  tokenAccountAddress: string;
  balance: number;
  incomingTransactions: Set<string>;
  outgoingTransactions: Set<string>;
};

// Queries solana.fm account-inputs for all token accounts belonging to `tokenMintAddress` with any activity between
// `startDate` and `endDate`
// Returns a list of all SolanaFMTokenAccountInfo (i.e. this would probably be used to see which new accounts were
// created that day and for updating balance/txn count for any previous accounts against some running db list)
// https://docs.solana.fm/docs/apis/account-input#retrieve-account-inputs-by-a-specific-token
export async function tokenAccountsInfoBetweenDatesSolanaFm(
  tokenMintAddress: string,
  startDate: Date,
  endDate: Date
) {
  const url = new URL(
    `https://api-alpha.solana.fm/api/v1/account-inputs/tokens/${tokenMintAddress}`
  );

  let results = await _fetchAllAccountInputsWithUrlAndDates(
    url,
    startDate,
    endDate
  );

  if (results === undefined) {
    // TODO: handle error here
    return undefined;
  }

  let accountInfoMap: { [key: string]: SolanaFMTokenAccountInfo } = {};

  // sort by date so that we can safely update `balance` to the latest one every time
  results
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .forEach((result) => {
      if (result.tokenId !== tokenMintAddress) {
        // TODO: this shouldn't ever happne, should log an error or something
        console.log("mismatched token id", result.tokenId, tokenMintAddress);
        return;
      }

      if (accountInfoMap[result.account] === undefined) {
        accountInfoMap[result.account] = {
          tokenAccountAddress: result.account,
          balance: 0,
          incomingTransactions: new Set<string>(),
          outgoingTransactions: new Set<string>(),
        };
      }

      accountInfoMap[result.account].balance = result.postBalance;

      // if it's a 0 change transaction, just count it as incoming? this happens a lot on sfm since it doesn't
      // have decimal precision
      if (result.postBalance >= result.preBalance) {
        accountInfoMap[result.account].incomingTransactions.add(
          result.transactionHash
        );
      } else {
        accountInfoMap[result.account].outgoingTransactions.add(
          result.transactionHash
        );
      }
    });

  console.log(results.length, " results");

  // TODO: Error ones are currently indistinguisableh from < 1 sRLY (both pre/post balance are 0), should try to
  // exclude error txns entirely, otherwise we'll need to ignore everything 0 < x < 1 too

  // TODO: postBalance as "-1" seems to mean CloseAccount instruction, we're ignoring closed accounts right now,
  // in the future we could take it into account somehow (e.g. manually reduce the number of "total accounts")

  return Object.values(accountInfoMap);
}
