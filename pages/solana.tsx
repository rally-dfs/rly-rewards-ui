import { useEffect, useState, useCallback } from "react";

import { clusterApiUrl, PublicKey, Connection } from "@solana/web3.js";
import { getAccount, TOKEN_PROGRAM_ID, Account } from "@solana/spl-token";
import {
  tokenAccountBalanceOnDateSolanaFm,
  getAllTokenBalancesBetweenDatesSolanaFm,
  tokenAccountsInfoBetweenDatesSolanaFm,
} from "../utils/solanaFm";
import {
  tokenAccountBalanceOnDateBitquery,
  getAllTokenBalancesBetweenDatesBitquery,
} from "../utils/bitquery";

const SOL_NETWORK = "testnet"; // TODO: can probably replace this with a const from wallet or something
const endpoint = clusterApiUrl(SOL_NETWORK);
const connection = new Connection(endpoint, "finalized");

// const RLY_PUBLIC_KEY = "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq";
// EY5hytBGAwkyJ1AzDCxM2Dcb4UfKQLN2zX5WmTLhc4Gk - testnet test token mint address

type TBCAccountInfo = {
  name: string;
  accountKeys: string[];
};

const tbcAccountInfos: TBCAccountInfo[] = [
  {
    name: "Test App 1",
    accountKeys: ["GqBLyjhMS3mWndmw5Gf4WuCFziZK7uS6dgV8EgbGjPoV"],
  },
  {
    name: "Test App 2",
    accountKeys: [
      "EbCiX8eR5Vkt8C9vxS1uZg4EVVLCp8bzTEGArmqDDqaL",
      "999q2CxUzHuHXsHBpCpk2BTYqpyBS9waFiX4vQiqFbAB",
    ],
  },
];

const useFetchSolanaOnChain = () => {
  // TODO: this should be rewritten (if we end up using on chain data), just messing around so it's messy/fragile

  // pubkey => amount
  const [amounts, setAmounts] = useState<object>({});

  const fetchData = useCallback(async () => {
    const promises = tbcAccountInfos
      .map((accountInfo) => {
        return accountInfo.accountKeys.map((keyString) => {
          // if (!amounts[keyString as keyof Object]) {
          console.log("getting ", keyString);
          return getAccount(
            connection,
            new PublicKey(keyString),
            "finalized",
            TOKEN_PROGRAM_ID
          );
          // }
        });
      })
      .reduce((acc, value) => acc.concat(value), []);

    let amts: { [key: string]: string } = {};

    await Promise.all(promises).then((results) => {
      results.map((result) => {
        amts[result.address.toString()] = result.amount.toString();
      });
      setAmounts(amts);
    });

    return amts;
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return amounts;
};

function Solana(data?: TestSolanaData) {
  const amounts = useFetchSolanaOnChain();

  const amountsDisplay = (
    <div>
      {tbcAccountInfos.map((accountInfo) => {
        return (
          <div key={accountInfo.name}>
            <p>{accountInfo.name}</p>
            {accountInfo.accountKeys.map((keyString) => {
              return (
                <div key={keyString}>
                  {keyString}: {amounts[keyString as keyof Object]}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <div>Solana on chain data here {amountsDisplay}</div>
      <p>
        solana fm graphql backend data here{" "}
        {JSON.stringify(data?.nativeToken, undefined, 2)}
      </p>
      <p>
        bitquery graphql backend data here{" "}
        {JSON.stringify(data?.transfers, undefined, 2)}
      </p>
    </div>
  );
}

// TODO: can also query with on chain getAccount() to sanity check? maybe not super accurate though since no effective date, would need to try to run it at exatly the same time (e.g. midnight GMT)

type TestSolanaData = {
  nativeToken?: object;
  transfers?: object;
  other?: string;
};

// TODO: we may want to refactor `Solana` to be a component instead of a page, e.g.
// const Solana: FC<TestSolanaData> = (testData?: TestSolanaData) => {
// would let us reuse it in multiple places but would need to refactor getServerSideProps
export async function getServerSideProps() {
  console.log("get server props");

  // // don't think there's a way to filter by `mint` so this is kind of useless
  // const { data: resultJson } = await queryApollo(
  //   solanaFmApolloClient,
  //   `query {
  //     solana {
  //       nativeAssociatedTokenAccounts(date: {
  //         from: "2022-02-28T05:00:47Z",
  //         to: "2022-02-28T20:00:47Z"
  //       }) {
  //         mint
  //         timestamp
  //         ataAddress
  //         transactionHash
  //         walletAddress
  //       }
  //     }
  //   }`,
  //   undefined
  // );

  // console.log("result json ", resultJson);

  // // just an example query, can't figure out a way to get the actual final balances so might need to just
  // // add up all the transactions
  // // (note we'd have to do a separate query with `receiverAddress: {is: tokenAccount}` also, the below
  // // account is just a random account on mainnet)
  // const { data: bitqueryResultJson } = await queryApollo(
  //   bitqueryApolloClient,
  //   `query MyQuery {
  //     solana {
  //       transfers(
  //         options: {limit: 2500}
  //         date: {between: ["2022-02-01", "2022-03-01"]}
  //         currency: {is: "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq"}
  //         senderAddress: {is: "DFP5VubfbjjstLkjENx4hUtiabVzhLpjTYUDJLSFoX8r"}
  //       ) {
  //         amount
  //         transferType
  //         transaction {
  //           signature
  //         }
  //         sender {
  //           address
  //           mintAccount
  //           type
  //         }
  //         receiver {
  //           address
  //           mintAccount
  //           type
  //         }
  //       }
  //     }
  //   }
  //   `,
  //   {}
  // );

  // console.log("bq result json ", bitqueryResultJson);

  // const packagedData: TestSolanaData = {
  //   nativeToken: resultJson.solana.nativeAssociatedTokenAccounts[0],
  //   transfers: bitqueryResultJson.solana.transfers,
  // };

  // console.log("data ", packagedData);

  // return {
  //   props: packagedData,
  // };

  // e.g. sfm looking up sRLY balance for DYmoSNjDhgSZ7marAgzQ2vLw4udyDe3uPZcugmPzVukZ on 2022-03-28
  // await tokenAccountBalanceOnDateSolanaFm(
  //   "DYmoSNjDhgSZ7marAgzQ2vLw4udyDe3uPZcugmPzVukZ",
  //   "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq",
  //   new Date("2022-03-28T00:00:00Z"),
  //   // 0 + a date assumes the all activity happened after that date
  //   0,
  //   new Date("2022-02-01T00:00:00Z")
  // );

  // // // e.g. bitquery looking up sRLY balance for DYmoSNjDhgSZ7marAgzQ2vLw4udyDe3uPZcugmPzVukZ on 2022-03-28
  // await tokenAccountBalanceOnDateBitquery(
  //   "DYmoSNjDhgSZ7marAgzQ2vLw4udyDe3uPZcugmPzVukZ",
  //   "Q11FqKrnqyW2w3dD7g14NfHgu4Knii2Y2ERrVrZAkEU",
  //   "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq",
  //   new Date("2022-03-15T00:00:00Z"),
  //   85303.53,
  //   new Date("2022-03-14T00:00:00Z")
  // );

  // sfm all balances
  // await getAllTokenBalancesBetweenDatesSolanaFm(
  //   "DYmoSNjDhgSZ7marAgzQ2vLw4udyDe3uPZcugmPzVukZ",
  //   "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq",
  //   new Date("2022-02-03T00:00:00Z"),
  //   new Date("2022-03-28T00:00:00Z"),
  //   undefined
  // );

  // sfm all balances with force load full
  // await getAllTokenBalancesBetweenDatesSolanaFm(
  //   "DYmoSNjDhgSZ7marAgzQ2vLw4udyDe3uPZcugmPzVukZ",
  //   "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq",
  //   new Date("2022-02-03T00:00:00Z"),
  //   new Date("2022-03-28T00:00:00Z"),
  //   new Date("2021-12-19T00:00:00Z")
  // );

  // bitquery all balances
  // let balances = await getAllTokenBalancesBetweenDatesBitquery(
  //   "DYmoSNjDhgSZ7marAgzQ2vLw4udyDe3uPZcugmPzVukZ",
  //   "Q11FqKrnqyW2w3dD7g14NfHgu4Knii2Y2ERrVrZAkEU",
  //   "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq",
  //   new Date("2021-12-20T00:00:00Z"),
  //   new Date("2022-03-28T00:00:00Z"),
  //   undefined
  // );

  // bitquery all balances (full load)
  // let balances = await getAllTokenBalancesBetweenDatesBitquery(
  //   "DYmoSNjDhgSZ7marAgzQ2vLw4udyDe3uPZcugmPzVukZ",
  //   "Q11FqKrnqyW2w3dD7g14NfHgu4Knii2Y2ERrVrZAkEU",
  //   "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq",
  //   new Date("2022-02-24T00:00:00Z"),
  //   new Date("2022-03-28T00:00:00Z"),
  //   new Date("2021-12-19T00:00:00Z") // gets full history back to this date for every date
  // );

  // console.log("balances", balances);

  // solana.fm token accounts info for RLY (in real life, we'd run this for some APP token instead, probably less txns)
  // let results = await tokenAccountsInfoBetweenDatesSolanaFm(
  //   "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq",
  //   new Date("2022-03-27T00:00:00Z"),
  //   new Date("2022-03-28T00:00:00Z")
  // );
  // console.log("results ", results);

  return { props: {} };
}

export default Solana;
