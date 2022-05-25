import React from 'react';
import Card from './card';

import CardClasses from '../styles/card.module.css';
import StyledButton from './styled_button';
import StyledLink from './styled_link';

const MetricsContainer = () => {
  return (
    <div
      className={CardClasses.card_container}
      style={{
        marginTop: 24,
        marginBottom: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
      <div className={CardClasses.small_card_wrapper}>
        <Card variant="small">
          <div>something will go here</div>
        </Card>

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
