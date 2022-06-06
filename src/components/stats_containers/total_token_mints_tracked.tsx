import React from 'react';
import Card from '../card';
import MetricHeader from '../metric_ui_elements/metric_header';
import StandaloneNumberMetric from '../metric_ui_elements/standalone_number_metric';

type TotalTokenMintsTrackedProps = {
  data?: number;
  filters?: any;
};

const TotalTokenMintsTracked = ({
  data,
  filters,
}: TotalTokenMintsTrackedProps) => {
  if (!data) {
    return null;
  }
  return (
    <Card variant="small">
      <MetricHeader title="Tokens Tracked" />
      <StandaloneNumberMetric metric={data} />
    </Card>
  );
};

export default TotalTokenMintsTracked;
