import React from 'react';
import './App.css';
import VerifyCustomerHolding from './components/verify-customer-holding';
import { EntryPage } from './components/entry-page';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Main } from './components/main';
import { Exchange } from './components/exchange';
import { FileUpload } from './components/file-upload';
import { ExchangeTable } from './components/exchange-table';
import TestForm from './components/test-form';

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

