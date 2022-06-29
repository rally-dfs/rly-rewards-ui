import React from 'react';
import './App.css';
import MetricsContainer from './components/metrics_container';

function App() {
  return (
    <div className="App">
      <header>
        <div className="d-flex ai-center">
          <svg
            className="icon"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M23.8588 4.80005L40.8 14.4V33.8824L23.8588 43.2001L7.20001 33.8824V14.4L23.8588 4.80005ZM12.847 17.7883L23.8587 11.2942L34.8705 17.7883L29.7882 20.8942L23.8587 17.2236L18.494 20.8942V33.8825L12.847 30.4942V17.7883Z"
              fill="currentColor"></path>
          </svg>
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
