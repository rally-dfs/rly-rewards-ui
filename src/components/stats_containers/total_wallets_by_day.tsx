import BasicLineGraph from '../metric_ui_elements/basic_line_graph';
import Card from '../card';
import MetricHeader from '../metric_ui_elements/metric_header';

type TotalWalletsByDayProps = {
  data: any;
};

const TotalWalletsByDay = ({ data }: TotalWalletsByDayProps) => {
  if (!data) {
    return null;
  }

  const walletCountsByDayByToken: Record<
    number,
    Record<string, number>
  > = data.non_zero_balances_by_mint;

  const allWallCountsByDayUnAggregated = Object.entries(
    walletCountsByDayByToken,
  )
    .map(([k, mintByDay]) => Object.entries(mintByDay))
    .flat();

  const allNonZeroBalanceByDay = allWallCountsByDayUnAggregated.reduce(
    (totals: Record<string, number>, [day, count]) => {
      const existingCount = totals[day] || 0;
      return Object.assign(totals, { [day]: existingCount + count });
    },
    {},
  );

  const dataToGraph = Object.entries(allNonZeroBalanceByDay)
    .map(([day, count]) => ({ x: day, y: count }))
    .sort((a, b) => {
      if (a.x > b.x) {
        return 1;
      }
      return -1;
    });

  return (
    <Card>
      <MetricHeader title="Total Non Zero Wallets" />
      <BasicLineGraph data={dataToGraph} />
    </Card>
  );
};

export default TotalWalletsByDay;
