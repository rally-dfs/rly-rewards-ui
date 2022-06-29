import React from 'react';
import { humanReadableNumber } from '../../human_readable_number';

import Styles from '../../styles/standalone_number_metric.module.css';

type StandaloneNumberMetricProps = {
  metric: number;
  unit?: string;
};
const StandaloneNumberMetric = ({
  metric,
  unit,
}: StandaloneNumberMetricProps) => {
  return (
    <div className={Styles.standalone_number_metric}>
      {humanReadableNumber(metric)}{' '}
      {unit && <span className={Styles.unit}>{unit}</span>}
    </div>
  );
};

export default StandaloneNumberMetric;
