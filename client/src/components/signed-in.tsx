import { FC, ReactNode, useState } from 'react';
import { BankOutlined, DollarOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, MenuProps, theme } from 'antd';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { FaMoneyBill, FaTools, FaInfoCircle } from 'react-icons/fa';
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
    if ( e.key === 'sign-out') {
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
      label: 'Funding'
    },
    {
      key: 'Holdings',
      icon: <FaMoneyBill/>,
      label: 'Holdings'
    },
    {
      key: 'verify',
      icon: <MailOutlined/>,
      label: 'Verification'
    },    {
      key: 'user',
      icon: <UserOutlined/>,
      label: 'User Settings'
    }
  ];

  const documentationSubMenu: MenuItem[] = [{
    key: '/docs/api',
    label: 'API Docs'
  }]

  mainMenuLinks.push({
    key: 'docs',
    icon: <FaInfoCircle/>,
    label: 'Docs',
    children: documentationSubMenu
  });

  if (isAdmin) {
    const adminSubMenu: MenuItem[] = [{
      key: '/admin/users',
      label: 'Users'
    },{
      key: '/admin/funding-generator',
      label: 'Funding Generator'
    }, {
      key: '/admin/email-tester',
      label: 'Email Tester'
    }, {
      key: '/admin/sha-256',
      label: 'Email Hash '
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

  mainMenuLinks.push( {
    key: 'sign-out',
    label: 'Sign Out',
    icon: <GoSignOut/>,
  })

  return (
    <Layout style={{minHeight: '100vh'}}>
      <Header style={{
        position: 'sticky'}}>
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
