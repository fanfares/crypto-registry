import ExchangePage from './exchange/exchange-page.tsx';
import { useStore } from '../store';
import SignedOutHome from './signed-out-home.tsx';

const Home = () => {
  const {isAuthenticated} = useStore();
  if (isAuthenticated) {
    return <ExchangePage/>;
  } else {
    return <SignedOutHome/>;
  }
};

export default Home;
