import BasicLineGraph from '../metric_ui_elements/basic_line_graph';
import Card from '../card';
import MetricHeader from '../metric_ui_elements/metric_header';
import { VanityMetricsResponse } from '../../types/vanity_metrics_response';

type TvlByDayProps = {
  data: VanityMetricsResponse;
};

const TvlByDay = ({ data }: TvlByDayProps) => {
  if (!data) {
    return null;
  }

  const dataToGraph = data.tvlByDay.map((r) => ({
    x: r.date,
    y: r.balance,
  }));

  return (
    <Card>
      <MetricHeader title="TVL by Day" />
      <BasicLineGraph data={dataToGraph} />
    </Card>
  );
};

export default TvlByDay;
