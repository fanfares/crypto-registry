import React from 'react';
import './App.css';
import VerifyCustomerHolding from './verify-customer-holding';
import { EntryPage } from './entry-page';

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Main } from './main';
import { Exchange } from './exchange';
import { FileUpload } from './file-upload';
import { ExchangeTable } from './exchange-table';
import TestForm from './test-form';
import ErrorMessage from './components/error-message';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/test" element={<TestForm />} />
            <Route path="/customer" element={<VerifyCustomerHolding />} />
            <Route path="/exchanges" element={<ExchangeTable />} />
            <Route path="/exchange" element={<Exchange />} />
            <Route path="/exchange/file-upload" element={<FileUpload />} />
          </Routes>
        </Main>
      </BrowserRouter>
    </div>
  );
}

export default App;

