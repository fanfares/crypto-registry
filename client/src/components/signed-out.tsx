import { ReactNode } from 'react';
import { CentreLayoutContainer } from './utils/centre-layout-container';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const {Header, Sider, Content} = Layout;

const SignedOut = (
  {children}: { children: ReactNode }
) => {
  const nav = useNavigate();
  return (
    <>
      <Layout>
        <Header>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={[{
              key: '1',
              label: 'CDR',
              onClick: () => nav('/')
            }, {
              key: '2',
              label: 'Sign In',
              onClick: () => nav('sign-in')
            }]}
            style={{flex: 1, minWidth: 0}}
          />
        </Header>
      </Layout>

      <CentreLayoutContainer>
        {children}
      </CentreLayoutContainer>
    </>
  );
};

export default SignedOut;
