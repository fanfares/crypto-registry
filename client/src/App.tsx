import React from 'react';
import './App.css';
import VerificationPage from './components/verification-page';
import { Home } from './components/home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Main } from './components/main';
import { SubmitFile } from './components/submit-file';
import TestForm from './components/test-form';
import { CheckSubmission } from './components/check-submission';
import Sha256Converter from './components/sha-256-converter';
import NetworkPage from './components/network-page';
import { InitiateApprovals } from './components/initiate-approvals';
import { ApproveRegistration } from './components/approve-registration';
import { ResetPassword } from './components/user/reset-password';
import ProtectedRoute from './components/user/protected-route';
import { SignInPage } from './components/user/sign-in-page';
import { Admin } from './components/admin';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/test" element={<TestForm/>}/>
            <Route path="/verify" element={<VerificationPage/>}/>
            <Route path="/check-submission" element={<ProtectedRoute outlet={<CheckSubmission />} />} />
            <Route path="/submit-file" element={<ProtectedRoute outlet={<SubmitFile />} />} />
            <Route path="/sha-256" element={<ProtectedRoute outlet={<Sha256Converter />} />} />
            <Route path="/network" element={<ProtectedRoute outlet={<NetworkPage/>}/>}/>
            <Route path="/verify-email" element={<InitiateApprovals/>}/>
            <Route path="/approve-registration" element={<ProtectedRoute outlet={<ApproveRegistration/>}/>}/>
            <Route path="/sign-in" element={<SignInPage/>}/>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Main>
      </BrowserRouter>
    </div>
  );
}

export default App;

