import React from 'react';
import './App.css';
import Balance from './Balance';
import Button from 'react-bootstrap/Button';
import { CustodianWalletService } from './open-api';

function App() {

  return (
    <div className="App">
      <Balance />

      <Button variant="primary"
              onClick={async () => {
                const custodians = await CustodianWalletService.getAllCustodians();
                console.log(custodians);
              }}
              type="button">Test</Button>

    </div>
  );
}

export default App;

