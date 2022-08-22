import React from 'react';
import './App.css';
import { Main } from './main';
import VerifyWallet from './verify-wallet';
import { SendAnEmail } from './send-an-email';

function App() {
  return (
    <div className="App">
      <Main>
        <VerifyWallet />
        {/*<SendAnEmail email={'rob@bitcoincustodianregistry.org'}></SendAnEmail>*/}
      </Main>
    </div>
  );
}

export default App;

