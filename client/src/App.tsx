import React from 'react';
import './App.css';
import VerifyCustomerHolding from './verify-customer-holiding';
import { EntryPage } from './entry-page';

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Main } from './main';
import { Custodian } from './custodian';
import { FileUpload } from './file-upload';
import { CustodianTable } from './custodian-table';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/customer" element={<VerifyCustomerHolding />} />
            <Route path="/custodians" element={<CustodianTable />} />
            <Route path="/custodian" element={<Custodian />} />
            <Route path="/custodian/file-upload" element={<FileUpload />} />
          </Routes>
        </Main>
      </BrowserRouter>
    </div>
  );
}

export default App;

