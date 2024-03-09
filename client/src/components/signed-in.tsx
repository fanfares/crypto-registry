import { FC, ReactNode, useState } from 'react';
import { BankOutlined, DollarOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, MenuProps, theme } from 'antd';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { FaInfoCircle, FaMoneyBill, FaTools } from 'react-icons/fa';
import { GoSignOut } from 'react-icons/go';

const {Header, Sider, Content} = Layout;

type MenuItem = Required<MenuProps>['items'][number];

export interface Props {
  children: ReactNode;
}

const SignedIn: FC<Props> = (
  {children}: Props
) => {
  const nav = useNavigate();
  const {isAdmin, signOut} = useStore();
  const [collapsed] = useState(false);
  const {
    token: {colorBgContainer, borderRadiusLG}
  } = theme.useToken();

  const mainMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'sign-out') {
      signOut();
      nav('/sign-in');
    } else {
      nav(e.key);
    }
  };

  const mainMenuLinks: MenuItem[] = [
    {
      key: 'exchange',
      icon: <BankOutlined/>,
      label: 'Exchange'
    }, {
      key: 'funding',
      icon: <DollarOutlined/>,
      label: 'On-Chain Funding'
    },
    {
      key: 'Holdings',
      icon: <FaMoneyBill/>,
      label: 'Customer Balances'
    },
    {
      key: 'verify',
      icon: <MailOutlined/>,
      label: 'Verification'
    }, {
      key: 'user',
      icon: <UserOutlined/>,
      label: 'User Settings'
    }
  ];

  const documentationSubMenu: MenuItem[] = [{
    key: '/docs/api',
    label: 'API'
  }, {
    key: '/docs/signatures',
    label: 'Signatures'
  }, {
    key: '/docs/hashed-emails',
    label: 'Hashed Emails'
  }];

  mainMenuLinks.push({
    key: 'docs',
    icon: <FaInfoCircle/>,
    label: 'Docs',
    children: documentationSubMenu
  });

  const toolsSubMenu: MenuItem[] = [{
    key: '/tools/view-wallet',
    label: 'View Wallet'
  }, {
    key: '/tools/balance-checker',
    label: 'Balance Checker'
  }, {
    key: '/tools/signature-generator',
    label: 'Signature Generator'
  }, {
    key: '/tools/funding-generator',
    label: 'Funding Generator'
  }, {
    key: '/tools/sha-256',
    label: 'Email Hash '
  }];

  mainMenuLinks.push({
    key: 'tools',
    icon: <FaTools/>,
    label: 'Tools',
    children: toolsSubMenu
  });

  if (isAdmin) {
    const adminSubMenu: MenuItem[] = [{
      key: '/admin/exchanges',
      label: 'Exchanges'
    }, {
      key: '/admin/users',
      label: 'Users'
    }, {
      key: '/tools/email-tester',
      label: 'Email Tester'
    }, {
      key: 'admin/general',
      label: 'General'
    }];

    mainMenuLinks.push({
      key: 'admin',
      label: 'Admin Tools',
      icon: <FaTools/>,
      children: adminSubMenu
    });
  }

  mainMenuLinks.push({
    key: 'sign-out',
    label: 'Sign Out',
    icon: <GoSignOut/>
  });

  return (
    <Layout style={{minHeight: '100vh'}}>
      <Header style={{
        position: 'sticky'
      }}>
      </Header>
      <Layout>

        <Sider trigger={null} collapsible collapsed={collapsed}>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            onClick={mainMenuClick}
            items={mainMenuLinks}
          />
        </Sider>
        <Layout>
          {/*<Header style={{padding: 0, background: colorBgContainer}}>*/}
          {/*  <Button*/}
          {/*    type="text"*/}
          {/*    icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined rev=""/>}*/}
          {/*    onClick={() => setCollapsed(!collapsed)}*/}
          {/*    style={{*/}
          {/*      fontSize: '16px',*/}
          {/*      width: 64,*/}
          {/*      height: 64*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</Header>*/}
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              height: 100,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            <Container>
              {children}
            </Container>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default SignedIn;
