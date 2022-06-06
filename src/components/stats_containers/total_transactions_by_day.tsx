import BasicLineGraph from '../metric_ui_elements/basic_line_graph';
import Card from '../card';
import MetricHeader from '../metric_ui_elements/metric_header';
import { VanityMetricsResponse } from '../../types/vanity_metrics_response';

type TotalTransactionsByDayProps = {
  data: VanityMetricsResponse;
};

const TotalTransactionsByDay = ({ data }: TotalTransactionsByDayProps) => {
  if (!data) {
    return null;
  }

  const dataToGraph = data.transactionsByDay.map((r) => ({
    x: r.date,
    y: r.transactionCount,
  }));

  return (
    <Card>
      <MetricHeader title="Total Transactions By Day" />
      <BasicLineGraph data={dataToGraph} />
    </Card>
  );
};

export default TotalTransactionsByDay;
