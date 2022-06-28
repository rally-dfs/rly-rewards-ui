import React from 'react';
import './App.css';
import MetricsContainer from './components/metrics_container';

function App() {
  return (
    <div className="App">
      <header>
        <div className="d-flex ai-center">
          <img
            src={require('./images/rly-logo.png')}
            alt="small rly network logo"
          />
          <div className="text-white header-company-name">
            <span style={{ fontWeight: 900 }}>RLY</span>Network
          </div>
        </div>
      </header>
      <h1>Network Metrics</h1>

      <MetricsContainer />
    </div>
  );
}

export default App;
