import { useStore } from '../store';
import SignedIn from './signed-in';
import SignedOut from './signed-out';
import { ReactNode } from 'react';

const Main = (
  {children}: { children: ReactNode }
) => {

  const {isAuthenticated} = useStore();

  if (isAuthenticated) {
    return <SignedIn>{children}</SignedIn>;
  } else {
    return <SignedOut>{children}</SignedOut>;
  }
};

export default Main;
