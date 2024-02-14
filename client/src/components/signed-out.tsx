import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const SignedOut = (
  {children}: { children: ReactNode }
) => {
  const nav = useNavigate();

  return <>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>

      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center' // Center content vertically in the available space
      }}>

        {children}

      </div>

      <div style={{
        width: '100%',
        height: '300px',
        backgroundColor: 'lightgrey',
        display: 'flex',
        justifyContent: 'space-evenly',
        padding: '40px'
      }}>
        <div>
          <h5>Exchanges</h5>
          {/*<a href="/link1">Background</a><br/>*/}
          <a href="#" onClick={() => {
            nav('sign-in');
          }}>Login</a><br/>
          <a href="/api-reference">API Reference</a>
        </div>

        <div>
          {/*    <h5>About Us</h5>*/}
          {/*    <a href="/about">Our Story</a><br/>*/}
          {/*    <a href="/terms">Terms of Service</a><br/>*/}
          {/*    <a href="/privacy">Privacy Policy</a>*/}
        </div>

        <div>
          {/*    <h5>Contact Us</h5>*/}
          {/*    <a href="/contact">Email</a><br/>*/}
          {/*    <a href="/support">Support</a>*/}
        </div>
      </div>
    </div>
  </>;
};

export default SignedOut;
