import React from 'react';

type MetricHeaderProps = {
  title: string;
};
const MetricHeader = ({ title }: MetricHeaderProps) => {
  return <div style={{ fontSize: 28 }}>{title}</div>;
};

export default MetricHeader;
