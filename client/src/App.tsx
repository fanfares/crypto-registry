import { useEffect } from 'react';
import './App.css';
import VerificationPage from './components/verification/verification-page';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sha256Converter from './components/admin-tools/sha-256-converter';
import { InitiateApprovals } from './components/registration/initiate-approvals';
import { ApproveRegistration } from './components/registration/approve-registration';
import { ResetPassword } from './components/auth/reset-password.tsx';
import ProtectedRoute from './components/auth/protected-route.tsx';
import SignInPage from './components/auth/sign-in-page.tsx';
import GeneralAdminTools from './components/admin-tools/general-admin-tools';
import { useStore } from './store';
import { ForgotPassword } from './components/auth/forgot-password.tsx';
import Exchange from './components/exchange/exchange';
import FundingPage from './components/funding/funding-page';
import HoldingsPage from './components/holdings/holdings-page';
import TestPage from './components/test-page';
import Main from './components/main';
import EmailTester from './components/admin-tools/email-tester';
import FundingGenerator from './components/admin-tools/funding-generator';
import Home from './components/home';
import PublicKeyForm from './components/user-settings/public-key-form.tsx';
import ApiDocsPage from './components/docs/api-docs-page.tsx';
import UsersPage from './components/user/users-page.tsx';

function App() {

  const {isAuthenticated, setSignInExpiry} = useStore();

  useEffect(() => {

    if (isAuthenticated) {
      const resetExpiryOnActivity = () => setSignInExpiry();

      document.addEventListener('mousemove', resetExpiryOnActivity);
      document.addEventListener('keydown', resetExpiryOnActivity);

      return () => {
        document.removeEventListener('mousemove', resetExpiryOnActivity);
        document.removeEventListener('keydown', resetExpiryOnActivity);
      };
    }

  }, [isAuthenticated, setSignInExpiry]);

  return (
    <div className="App">
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/test" element={<TestPage/>}/>
            <Route path="/exchange" element={<ProtectedRoute outlet={<Exchange/>}/>}/>
            <Route path="/funding" element={<ProtectedRoute outlet={<FundingPage/>}/>}/>
            <Route path="/holdings" element={<ProtectedRoute outlet={<HoldingsPage/>}/>}/>
            <Route path="/docs/api" element={<ProtectedRoute outlet={<ApiDocsPage/>}/>}/>
            <Route path="user" element={<PublicKeyForm/>}/>
            <Route path="/verify-email" element={<InitiateApprovals/>}/>
            <Route path="/verify" element={<VerificationPage/>}/>
            <Route path="/admin/users" element={<ProtectedRoute outlet={<UsersPage/>}/>}/>
            <Route path="/admin/email-tester" element={<ProtectedRoute outlet={<EmailTester/>}/>}/>
            <Route path="/admin/funding-generator" element={<ProtectedRoute outlet={<FundingGenerator/>}/>}/>
            <Route path="/admin/general" element={<ProtectedRoute outlet={<GeneralAdminTools/>}/>}/>
            <Route path="/admin/sha-256" element={<ProtectedRoute outlet={<Sha256Converter/>}/>}/>
            <Route path="/approve-registration" element={<ProtectedRoute outlet={<ApproveRegistration/>}/>}/>
            <Route path="/sign-in" element={<SignInPage/>}/>
            <Route path="/reset-password" element={<ResetPassword/>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            <Route path="/admin" element={<ProtectedRoute outlet={<GeneralAdminTools/>}/>}/>
          </Routes>
        </Main>
      </BrowserRouter>
    </div>
  );
}

export default App;

