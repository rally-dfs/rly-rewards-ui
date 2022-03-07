import { useEffect, useState, useCallback } from "react";
import { createApolloClient, queryApollo } from "../utils/solanaApollo";
import { clusterApiUrl, PublicKey, Connection } from "@solana/web3.js";
import { getAccount, TOKEN_PROGRAM_ID, Account } from "@solana/spl-token";
import { urlObjectKeys } from "next/dist/shared/lib/utils";

const SOL_NETWORK = "testnet"; // TODO: can probably replace this with a const from wallet or something
const endpoint = clusterApiUrl(SOL_NETWORK);
const connection = new Connection(endpoint, "finalized");

// TODO: probably don't need both of these, just testing
const solanaFmApolloClient = createApolloClient("https://api.solana.fm", {
  apikey: process.env.SOLANA_FM_API_KEY,
  "Content-Type": "application/json",
});

const bitqueryApolloClient = createApolloClient(
  "https://graphql.bitquery.io/",
  {
    "X-API-KEY": process.env.BITQUERY_API_KEY,
    "Content-Type": "application/json",
  }
);

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

  // don't think there's a way to filter by `mint` so this is kind of useless
  const { data: resultJson } = await queryApollo(
    solanaFmApolloClient,
    `query {
      solana {
        nativeAssociatedTokenAccounts(date: {
          from: "2022-02-28T05:00:47Z",
          to: "2022-02-28T20:00:47Z"
        }) {
          mint
          timestamp
          ataAddress
          transactionHash
          walletAddress
        }
      }
    }`,
    undefined
  );

  console.log("result json ", resultJson);

  // just an example query, can't figure out a way to get the actual final balances so might need to just
  // add up all the transactions
  // (note we'd have to do a separate query with `receiverAddress: {is: tokenAccount}` also, the below
  // account is just a random account on mainnet)
  const { data: bitqueryResultJson } = await queryApollo(
    bitqueryApolloClient,
    `query MyQuery {
      solana {
        transfers(
          options: {limit: 2500}
          date: {between: ["2022-02-01", "2022-03-01"]}
          currency: {is: "RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq"}
          senderAddress: {is: "DFP5VubfbjjstLkjENx4hUtiabVzhLpjTYUDJLSFoX8r"}
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
    {}
  );

  console.log("bq result json ", bitqueryResultJson);

  const packagedData: TestSolanaData = {
    nativeToken: resultJson.solana.nativeAssociatedTokenAccounts[0],
    transfers: bitqueryResultJson.solana.transfers,
  };

  console.log("data ", packagedData);

  return {
    props: packagedData,
  };
}

export default Solana;
