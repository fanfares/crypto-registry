import React from 'react';
import './App.css';
import VerifyCustomerHolding from './verify-customer-holiding';
import { EntryPage } from './entry-page';

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Main } from './main';
import { Exchange } from './exchange';
import { FileUpload } from './file-upload';
import { ExchangeTable } from './exchange-table';
import TestForm from './test-form';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/test" element={<TestForm />} />
            <Route path="/customer" element={<VerifyCustomerHolding />} />
            <Route path="/custodians" element={<ExchangeTable />} />
            <Route path="/custodian" element={<Exchange />} />
            <Route path="/custodian/file-upload" element={<FileUpload />} />
          </Routes>
        </Main>
      </BrowserRouter>
    </div>
  );
}

export default App;

