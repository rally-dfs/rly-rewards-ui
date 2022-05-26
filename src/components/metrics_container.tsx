import React from 'react';
import Card from './card';

import CardClasses from '../styles/card.module.css';
import StyledButton from './styled_button';
import { useFetchResource } from '../use_fetch_resource';
import LoadingSpinner from './loading_spinner';
import TotalTokenMintsTracked from './stats_containers/total_token_mints_tracked';
import TotalWalletsByDay from './stats_containers/total_wallets_by_day';

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
          <div>something will go here</div>
        </Card>
      </div>

      <TotalWalletsByDay data={allData} />

      <Card variant="small">
        <div>something will go here</div>
        <StyledButton text="Click me" onClick={() => {}} />
      </Card>
    </div>
  );
};

export default MetricsContainer;
