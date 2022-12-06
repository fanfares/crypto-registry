import React from 'react';
import './App.css';
import VerifyHoldings from './components/verify-holdings';
import { EntryPage } from './components/entry-page';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Main } from './components/main';
import { Exchange } from './components/exchange';
import { FileUpload } from './components/file-upload';
import TestForm from './components/test-form';
import { CheckSubmission } from './components/check-submission';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/test" element={<TestForm />} />
            <Route path="/verify" element={<VerifyHoldings />} />
            <Route path="/check-submission" element={<CheckSubmission />} />
            <Route path="/exchange" element={<Exchange />} />
            <Route path="/submit-file" element={<FileUpload />} />
          </Routes>
        </Main>
      </BrowserRouter>
    </div>
  );
}

export default App;

