import React from 'react';
import './App.css';
import { Main } from './main';
import VerifyWallet from './verify-wallet';

function App() {
  return (
    <div className="App">
      <Main>
        <VerifyWallet />
      </Main>
    </div>
  );
}

export default App;

