import React from 'react';
import './App.css';
import VerifyHoldings from './components/verify-holdings';
import { Home } from './components/home';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Main } from './components/main';
import { SubmitFile } from './components/submit-file';
import TestForm from './components/test-form';
import { CheckSubmission } from './components/check-submission';
import Sha256Converter from './components/sha-256-converter';
import RequestKey from './components/request-key';
import NetworkPage from './components/networkPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestForm />} />
            <Route path="/verify" element={<VerifyHoldings />} />
            <Route path="/check-submission" element={<CheckSubmission />} />
            <Route path="/submit-file" element={<SubmitFile />} />
            <Route path="/sha-256" element={<Sha256Converter />} />
            <Route path="/request-key" element={<RequestKey />} />
            <Route path="/network" element={<NetworkPage />} />
          </Routes>
        </Main>
      </BrowserRouter>
    </div>
  );
}

export default App;

