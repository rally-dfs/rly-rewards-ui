import React from 'react';
import { humanReadableNumber } from '../../human_readable_number';

type StandaloneNumberMetricProps = {
  metric: number;
};
const StandaloneNumberMetric = ({ metric }: StandaloneNumberMetricProps) => {
  return (
    <div style={{ fontSize: 72, marginTop: 12 }}>
      {humanReadableNumber(metric)}
    </div>
  );
};

export default StandaloneNumberMetric;
