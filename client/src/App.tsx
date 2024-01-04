import React, { useEffect } from 'react';
import './App.css';
import VerificationPage from './components/verification/verification-page';
import { Home } from './components/home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Main } from './components/main';
import Sha256Converter from './components/sha-256/sha-256-converter';
import { InitiateApprovals } from './components/registration/initiate-approvals';
import { ApproveRegistration } from './components/registration/approve-registration';
import { ResetPassword } from './components/user/reset-password';
import ProtectedRoute from './components/user/protected-route';
import { SignInPage } from './components/user/sign-in-page';
import { Admin } from './components/admin/admin';
import { useStore, useWebSocket } from './store';
import { ForgotPassword } from './components/user/forgot-password';
import { FundingSubmissionForm } from './components/funding/funding-submission-form';
import { HoldingsSubmissionForm } from './components/holdings/holdings-submission-form';
import Exchange from './components/exchange/exchange';

function App() {

  const {isAuthenticated, setSignInExpiry} = useStore();
  const { getSocket, closeSocket } = useWebSocket();

  useEffect(() => {
    getSocket();

    if (isAuthenticated) {
      const resetExpiryOnActivity = () => setSignInExpiry();

      document.addEventListener('mousemove', resetExpiryOnActivity);
      document.addEventListener('keydown', resetExpiryOnActivity);

      return () => {
        document.removeEventListener('mousemove', resetExpiryOnActivity);
        document.removeEventListener('keydown', resetExpiryOnActivity);
      };
    }

    return () => {
      closeSocket();
    }
  }, [isAuthenticated, setSignInExpiry]);

  return (
    <div className="App">
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/verify" element={<VerificationPage/>}/>
            <Route path="/exchange" element={<ProtectedRoute outlet={<Exchange/>}/>}/>
            <Route path="/funding" element={<ProtectedRoute outlet={<FundingSubmissionForm/>}/>}/>
            <Route path="/holdings" element={<ProtectedRoute outlet={<HoldingsSubmissionForm/>}/>}/>
            <Route path="/sha-256" element={<ProtectedRoute outlet={<Sha256Converter/>}/>}/>
            <Route path="/verify-email" element={<InitiateApprovals/>}/>
            <Route path="/approve-registration" element={<ProtectedRoute outlet={<ApproveRegistration/>}/>}/>
            <Route path="/sign-in" element={<SignInPage/>}/>
            <Route path="/reset-password" element={<ResetPassword/>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            <Route path="/admin" element={<ProtectedRoute outlet={<Admin/>}/>}/>
          </Routes>
        </Main>
      </BrowserRouter>
    </div>
  );
}

export default App;

