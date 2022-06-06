import BasicLineGraph from '../metric_ui_elements/basic_line_graph';
import Card from '../card';
import MetricHeader from '../metric_ui_elements/metric_header';
import { VanityMetricsResponse } from '../../types/vanity_metrics_response';

type TotalWalletsByDayProps = {
  data: VanityMetricsResponse;
};

const TotalWalletsByDay = ({ data }: TotalWalletsByDayProps) => {
  if (!data) {
    return null;
  }

  const dataToGraph = data.walletsByDay.map((r) => ({
    x: r.date,
    y: r.walletCount,
  }));

  return (
    <Card>
      <MetricHeader title="Total Token Holding Wallets" />
      <BasicLineGraph data={dataToGraph} />
    </Card>
  );
};

export default TotalWalletsByDay;
