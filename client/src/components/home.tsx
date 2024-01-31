import ExchangePage from './exchange/exchange-page.tsx';
import { useStore } from '../store';
import VerificationPage from './verification/verification-page';

const Home = () => {

  const {isAuthenticated} = useStore();

  if (isAuthenticated) {

    return (
      <ExchangePage/>
    );
  } else {
    return <VerificationPage/>;
  }

};

export default Home
