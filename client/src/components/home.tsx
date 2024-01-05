import { CentreLayoutContainer } from './utils/centre-layout-container';
import Exchange from './exchange/exchange';
import { useStore } from '../store';
import VerificationPage from './verification/verification-page';

export const Home = () => {

  const {isAuthenticated} = useStore();

  if (isAuthenticated) {

    return (
      <CentreLayoutContainer>
        <Exchange/>
      </CentreLayoutContainer>
    );
  } else {
    return <VerificationPage/>
  }

};
