import React from 'react';
import './App.css';
import Card from './components/card';

function App() {
  return (
    <div className="App">
      <header>
        <div className="d-flex ai-center">
          <img
            src={require('./images/rly-logo.png')}
            alt="small rly network logo"
          />
          <div
            className="text-white"
            style={{
              fontWeight: 600,
              textTransform: 'uppercase',
              marginLeft: 12,
            }}>
            RLY Network
          </div>
        </div>
      </header>
      <h1>RLY Network Metrics</h1>

      <Card style={{ marginTop: 12 }}>
        <div>something will go here</div>
      </Card>
    </div>
  );
}

export default App;
