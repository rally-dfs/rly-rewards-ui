import React from 'react';
import MetricHeader from './metric_header';

type StandaloneNumberMetricProps = {
  title: string;
  metric: string | number;
};
const StandaloneNumberMetric = ({
  metric,
  title,
}: StandaloneNumberMetricProps) => {
  return (
    <>
      <MetricHeader title={title} />
      <div style={{ fontSize: 72, marginTop: 12 }}>{metric}</div>
    </>
  );
};

export default StandaloneNumberMetric;
