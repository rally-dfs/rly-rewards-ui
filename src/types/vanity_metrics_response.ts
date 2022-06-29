export interface VanityMetricsResponse {
  totalTokensTracked: number;
  totalWallets: number;
  walletsByDay: { date: string; walletCount: number }[];
  totalTransactions: number;
  transactionsByDay: { date: string; transactionCount: number }[];
  tvl: number;
  tvlByDay: { date: string; balance: number }[];
  totalRewards: number;
}
