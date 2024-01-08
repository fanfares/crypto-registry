import Exchange from './exchange/exchange';
import { useStore } from '../store';
import VerificationPage from './verification/verification-page';

const Home = () => {

  const {isAuthenticated} = useStore();

  if (isAuthenticated) {

    return (
      <Exchange/>
    );
  } else {
    return <VerificationPage/>;
  }

};

export default Home
