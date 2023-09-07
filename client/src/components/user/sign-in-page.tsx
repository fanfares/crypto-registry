import { Tab, Tabs } from 'react-bootstrap';
import { SignIn } from './sign-in';
import { SignUp } from './sign-up';
import { Properties } from 'csstype';

const centreContainer: Properties = {
  display: 'flex',
  justifyContent: 'center', /* Center horizontally */
  alignItems: 'center',    /* Center vertically */
  height: '50vh'           /* 100% of the viewport height */
}

const loginDialog: Properties = {
  width: '500px',
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
}

export const SignInPage = () => {
  return (
    <div style={centreContainer}>
      <div style={loginDialog}>
        <Tabs
          defaultActiveKey="sign-in"
          className="mb-3 h-100"
          fill>

          <Tab eventKey="sign-in" title="Sign In">
            <SignIn/>
          </Tab>

          <Tab eventKey="sign-up" title="Sign Up">
            <SignUp/>
          </Tab>

        </Tabs>
      </div>
    </div>


  );
}
