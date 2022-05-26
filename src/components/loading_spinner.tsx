import React from 'react';

import SpinnerStyle from '../styles/loading_spinner.module.css';

const LoadingSpinner = () => {
  return (
    <div className={SpinnerStyle.lds_ring}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingSpinner;
