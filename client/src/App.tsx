import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sha256Converter from './components/admin-tools/sha-256-converter';
import { InitiateApprovals } from './components/registration/initiate-approvals';
import { ResetPassword } from './components/auth/reset-password.tsx';
import ProtectedRoute from './components/auth/protected-route.tsx';
import SignInPage from './components/auth/sign-in-page.tsx';
import GeneralAdminTools from './components/admin-tools/general-admin-tools';
import { useStore } from './store';
import { ForgotPassword } from './components/auth/forgot-password.tsx';
import ExchangePage from './components/exchange/exchange-page.tsx';
import FundingPage from './components/funding/funding-page';
import HoldingsPage from './components/holdings/holdings-page';
import TestPage from './components/test-page';
import Main from './components/main';
import EmailTester from './components/admin-tools/email-tester';
import FundingGenerator from './components/admin-tools/funding-generator';
import Home from './components/home';
import ApiDocsPage from './components/docs/api-docs-page.tsx';
import UsersPage from './components/user/users-page.tsx';
import { ExchangesPage } from './components/exchange/exchanges-page.tsx';
import SignatureGenerator from './components/admin-tools/signature-generator.tsx';
import SignatureDocs from './components/docs/signature-docs.tsx';
import HashedEmails from './components/docs/hashed-emails.tsx';
import BalanceChecker from './components/admin-tools/balance-checker.tsx';
import ViewWallet from './components/admin-tools/view-wallet.tsx';
import VerificationPage from './components/verification/verification-page.tsx';
import UserSettingsPage from './components/user-settings/user-settings-page.tsx';
import AboutUsPage from './components/about-us-page.tsx';
import { notification } from 'antd';
import { setNotificationApi } from './utils/notification-utils.ts';
import FaqPage from './components/faq-page.tsx';
import ContactUsPage from './components/contact-us-page.tsx';

function App() {

  const {isAuthenticated, setSignInExpiry} = useStore();
  const [api, contextHolder] = notification.useNotification();

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

  useEffect(() => {
    setNotificationApi(api);
  }, [api]);

  return (
    <div className="App">
      {contextHolder}
      <BrowserRouter>
        <Main>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/test" element={<TestPage/>}/>
            <Route path="/exchange" element={<ProtectedRoute outlet={<ExchangePage/>}/>}/>
            <Route path="/funding" element={<ProtectedRoute outlet={<FundingPage/>}/>}/>
            <Route path="/holdings" element={<ProtectedRoute outlet={<HoldingsPage/>}/>}/>
            <Route path="/docs/api" element={<ProtectedRoute outlet={<ApiDocsPage/>}/>}/>
            <Route path="/docs/signatures" element={<ProtectedRoute outlet={<SignatureDocs/>}/>}/>
            <Route path="/docs/hashed-emails" element={<ProtectedRoute outlet={<HashedEmails/>}/>}/>
            <Route path="user" element={<ProtectedRoute outlet={<UserSettingsPage/>}/>}/>
            <Route path="/verify-email" element={<InitiateApprovals/>}/>
            <Route path="/verify" element={<ProtectedRoute outlet={<VerificationPage/>}/>}/>
            <Route path="/admin/users" element={<ProtectedRoute outlet={<UsersPage/>}/>}/>
            <Route path="/admin/exchanges" element={<ProtectedRoute outlet={<ExchangesPage/>}/>}/>
            <Route path="/admin/general" element={<ProtectedRoute outlet={<GeneralAdminTools/>}/>}/>
            <Route path="/tools/view-wallet" element={<ProtectedRoute outlet={<ViewWallet/>}/>}/>
            <Route path="/tools/balance-checker" element={<ProtectedRoute outlet={<BalanceChecker/>}/>}/>
            <Route path="/tools/funding-generator" element={<ProtectedRoute outlet={<FundingGenerator/>}/>}/>
            <Route path="/tools/signature-generator" element={<ProtectedRoute outlet={<SignatureGenerator/>}/>}/>
            <Route path="/tools/sha-256" element={<ProtectedRoute outlet={<Sha256Converter/>}/>}/>
            <Route path="/tools/email-tester" element={<ProtectedRoute outlet={<EmailTester/>}/>}/>
            {/*<Route path="/approve-registration" element={<ProtectedRoute outlet={<ApproveRegistration/>}/>}/>*/}
            <Route path="/sign-in" element={<SignInPage/>}/>
            <Route path="/about-us" element={<AboutUsPage/>}/>
            <Route path="/faq" element={<FaqPage/>}/>
            <Route path="/contact-us" element={<ContactUsPage/>}/>
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

