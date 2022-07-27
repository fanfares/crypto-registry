import React from 'react';
import './App.css';
import VerifyWallet from './verify-wallet';
import Wrapper from './wrapper';

function App() {
  return (
    <div className="App">
      <Wrapper>
        <VerifyWallet />
      </Wrapper>
    </div>
  );
}

export default App;

