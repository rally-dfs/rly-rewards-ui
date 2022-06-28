import React from 'react';
import { humanReadableNumber } from '../../human_readable_number';

import Styles from '../../styles/standalone_number_metric.module.css';

type StandaloneNumberMetricProps = {
  metric: number;
};
const StandaloneNumberMetric = ({ metric }: StandaloneNumberMetricProps) => {
  return (
    <div className={Styles.standalone_number_metric}>
      {humanReadableNumber(metric)}
    </div>
  );
};

export default StandaloneNumberMetric;
