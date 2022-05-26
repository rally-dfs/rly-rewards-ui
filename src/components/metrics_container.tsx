import React from 'react';
import Card from './card';

import CardClasses from '../styles/card.module.css';
import StyledButton from './styled_button';
import StyledLink from './styled_link';
import { useFetchResource } from '../use_fetch_resource';
import LoadingSpinner from './loading_spinner';
import TotalTokenMintsTracked from './stats_containers/total_token_mints_tracked';

const MetricsContainer = () => {
  const [loading, , allData] = useFetchResource('http://localhost:3001/');

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

      <Card>
        <div>something will go here</div>
        <StyledLink
          href="https://github.com/rally-dfs/rly-rewards"
          text="Link to UI project"
        />
      </Card>

      <Card variant="small">
        <div>something will go here</div>
        <StyledButton text="Click me" onClick={() => {}} />
      </Card>
    </div>
  );
};

export default MetricsContainer;
