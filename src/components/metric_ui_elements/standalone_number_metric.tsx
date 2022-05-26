import React from 'react';

type StandaloneNumberMetricProps = {
  metric: string | number;
};
const StandaloneNumberMetric = ({ metric }: StandaloneNumberMetricProps) => {
  return <div style={{ fontSize: 72, marginTop: 12 }}>{metric}</div>;
};

export default StandaloneNumberMetric;
