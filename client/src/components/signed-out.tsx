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
          <a href="#" onClick={() => {
            nav('sign-in');
          }}>Login</a><br/>
          <a href="/api-reference">API Reference</a>
        </div>

        <div>
          <h5>Company Info</h5>
          <a href="#" onClick={() => nav('about-us')}>About Us</a><br/>
        </div>

        <div>
          <h5>Support</h5>
          <a href="#" onClick={() => nav('contact-us')}>Contact Us</a><br/>
          <a href="#" onClick={() => nav('faq')}>FAQ</a><br/>
        </div>
      </div>
    </div>
  </>;
};

export default SignedOut;
