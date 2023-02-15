import { Tab, Tabs } from 'react-bootstrap';
import { SignIn } from './sign-in';
import { SignUp } from './sign-up';

export const SignInPage = () => {
  return (
    <Tabs
      defaultActiveKey="sign-in"
      className="mb-3 h-100"
      fill>

      <Tab eventKey="sign-in" title="Sign In">
        <SignIn />
      </Tab>

      <Tab eventKey="sign-up" title="Sign Up">
        <SignUp />
      </Tab>

    </Tabs>
  );
}
