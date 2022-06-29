import React from 'react';
import Card from './card';

import CardClasses from '../styles/card.module.css';
import { useFetchResource } from '../use_fetch_resource';
import LoadingSpinner from './loading_spinner';
import MetricHeader from './metric_ui_elements/metric_header';
import StandaloneNumberMetric from './metric_ui_elements/standalone_number_metric';
import { VanityMetricsResponse } from '../types/vanity_metrics_response';

import TvlByDay from './stats_containers/tvl_by_day';

const MetricsContainer = () => {
  const [loading, , allData] = useFetchResource<VanityMetricsResponse>(
    'http://rly-rewards-staging.us-west-1.elasticbeanstalk.com/vanity_metrics',
  );

  if (loading || !allData) {
    return (
      <div className={CardClasses.card_container}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={CardClasses.card_container}>
      <div className={CardClasses.small_card_wrapper}>
        <Card variant="small">
          <MetricHeader title="Total Wallets" />
          <StandaloneNumberMetric metric={allData.totalWallets} />
        </Card>

        <Card variant="small">
          <MetricHeader title="Total Transactions" />
          <StandaloneNumberMetric metric={allData.totalTransactions} />
        </Card>

        <Card variant="small">
          <MetricHeader title="Total $RLY Locked" />
          <StandaloneNumberMetric metric={allData.tvl} />
        </Card>

        <Card variant="small">
          <MetricHeader title="$RLY Rewards Distributed" />
          <StandaloneNumberMetric metric={allData.totalRewards} />
        </Card>
      </div>

      <TvlByDay data={allData} />
    </div>
  );
};

export default MetricsContainer;
