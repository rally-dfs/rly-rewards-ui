import React from 'react';
import Card from './card';

import CardClasses from '../styles/card.module.css';
import { useFetchResource } from '../use_fetch_resource';
import LoadingSpinner from './loading_spinner';
import TotalTokenMintsTracked from './stats_containers/total_token_mints_tracked';
import TotalWalletsByDay from './stats_containers/total_wallets_by_day';
import TableExampleStat from './stats_containers/table_example_stat';
import MetricHeader from './metric_ui_elements/metric_header';
import StandaloneNumberMetric from './metric_ui_elements/standalone_number_metric';

const MetricsContainer = () => {
  const [loading, , allData] = useFetchResource(
    'http://rly-rewards-env.eba-dnwcpkfk.us-west-1.elasticbeanstalk.com/',
  );

  if (loading) {
    return (
      <div className={CardClasses.card_container}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={CardClasses.card_container}>
      <div className={CardClasses.small_card_wrapper}>
        <TotalTokenMintsTracked data={allData} />

        <Card variant="small">
          <MetricHeader title="TVL in TBCs" />
          <StandaloneNumberMetric metric="1.3m sol" />
        </Card>
      </div>

      <TotalWalletsByDay data={allData} />

      <TableExampleStat data={allData as Record<string, any>} />
    </div>
  );
};

export default MetricsContainer;
