import React from 'react';
import Card from './card';

import CardClasses from '../styles/card.module.css';

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
      </Card>

      <Card variant="small">
        <div>something will go here</div>
      </Card>
    </div>
  );
};

export default MetricsContainer;
