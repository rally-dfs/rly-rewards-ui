import React from 'react';
import Card from './card';

import CardClasses from '../styles/card.module.css';
import { useFetchResource } from '../use_fetch_resource';
import LoadingSpinner from './loading_spinner';
import TotalTokenMintsTracked from './stats_containers/total_token_mints_tracked';
import MetricHeader from './metric_ui_elements/metric_header';
import StandaloneNumberMetric from './metric_ui_elements/standalone_number_metric';
import { VanityMetricsResponse } from '../types/vanity_metrics_response';

import TotalWalletsByDay from './stats_containers/total_wallets_by_day';
import TotalTransactionsByDay from './stats_containers/total_transactions_by_day';
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
        <TotalTokenMintsTracked data={allData?.totalTokensTracked} />

        <Card variant="small">
          <MetricHeader title="TVL in TBCs" />
          <StandaloneNumberMetric metric={allData.tvl.toString()} />
        </Card>

        <Card variant="small">
          <MetricHeader title="Total Wallets" />
          <StandaloneNumberMetric metric={allData.totalWallets.toString()} />
        </Card>

        <Card variant="small">
          <MetricHeader title="Total Transactions" />
          <StandaloneNumberMetric
            metric={allData.totalTransactions.toString()}
          />
        </Card>
      </div>

      <TotalWalletsByDay data={allData} />
      <TotalTransactionsByDay data={allData} />
      <TvlByDay data={allData} />
    </div>
  );
};

export default MetricsContainer;
