import React from 'react';
import Card from '../card';
import MetricHeader from '../metric_ui_elements/metric_header';
import StandaloneNumberMetric from '../metric_ui_elements/standalone_number_metric';

type TotalTokenMintsTrackedProps = {
  data: any;
  filters?: any;
};

const TotalTokenMintsTracked = ({
  data,
  filters,
}: TotalTokenMintsTrackedProps) => {
  const totalTokensTracked = () => {
    if (!data) {
      return -1;
    }
    return data.token_account_mints.length;
  };

  return (
    <Card variant="small">
      <MetricHeader title="Tokens Tracked" />
      <StandaloneNumberMetric metric={totalTokensTracked()} />
    </Card>
  );
};

export default TotalTokenMintsTracked;
