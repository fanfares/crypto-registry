import { CentreLayoutContainer } from './centre-layout-container';
import Exchange from './exchange/exchange';

export const Home = () => {

  return (
    <CentreLayoutContainer>
      <h1>Customer Deposits Registry</h1>

      <p>Welcome to the home of Crypto Compliance. This network allows custodians of
        Bitcoin to prove they are holding all of their customers assets </p>

      <Exchange/>

    </CentreLayoutContainer>

  );
};
