import { useCallback, useEffect, useState } from 'react';
import { AuthService, UserDto, UserService } from '../../open-api';
import { notification, Space, Table, TableProps, Typography } from 'antd';
import { format, parseISO } from 'date-fns';
import CreateUser from './create-user.tsx';
import { getErrorMessage } from '../../utils';
import EditUser from './edit-user.tsx';

const UsersPage = () => {
  const [users, setUsers] = useState<UserDto[]>();
  const [api, contextHolder] = notification.useNotification();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);

  const openEditDialog = (user: UserDto) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditUser(null);
    setShowEditModal(false);
  };

  const editSuccess = async () => {
    await loadUsers()
    setEditUser(null);
    setShowEditModal(false);
  };

  const errorNotification = (error: string) => {
    api['error']({
      message: 'Operation Failed',
      description: error
    });
  };

  const successNotification = (message: string) => {
    api['success']({
      message: 'Operation Succeeded',
      description: message
    });
  };

  const deleteUser = async (user: UserDto) => {
    try {
      await UserService.deleteUser(user._id);
      await loadUsers();
      successNotification('User Deleted');
    } catch (err) {
      errorNotification(getErrorMessage(err));
    }
  };

  const inviteUser = async (user: UserDto) => {
    try {
      await AuthService.sendInvite(user._id);
      successNotification('Invite Sent');
    } catch (err) {
      errorNotification(getErrorMessage(err));
    }
  };

  const loadUsers = useCallback(async () => {
    const users = await UserService.getUsers();
    setUsers(users);
  }, []);


  const columns: TableProps<UserDto>['columns'] = [{
    title: 'Email',
    dataIndex: 'email',
    key: 'email'
  }, {
    title: 'Exchange',
    dataIndex: 'exchangeName',
    key: 'exchangeName',
  }, {
    title: 'Role',
    dataIndex: 'isSystemAdmin',
    key: 'isSystemAdmin',
    render: (_, user) => {
      return user.isSystemAdmin ? 'System Admin' : 'Exchange User';
    }
  }, {
    title: 'Last Sign In',
    dataIndex: 'lastSignIn',
    key: 'lastSignIn',
    render: (_, user) => {
      if (user.lastSignIn) {
        return format(parseISO(user.lastSignIn), 'HH:mm dd/MM/yyyy');
      } else {
        return '-';
      }
    }
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, user) => {
      return (
        <Space>
          <Typography.Link onClick={() => inviteUser(user)}>
            Invite
          </Typography.Link>
          <Typography.Link onClick={() => openEditDialog(user)}>
            Edit
          </Typography.Link>
          <Typography.Link onClick={() => deleteUser(user)}>
            Delete
          </Typography.Link>
        </Space>
      );
    }
  }];

  useEffect(() => {
    loadUsers().then();
  }, []);

  return (
    <>
      {contextHolder}
      <h1>Users</h1>
      {editUser ?
        <EditUser onSuccess={() => editSuccess().then()}
                  onCancel={() => cancelEdit()}
                  user={editUser}
                  open={showEditModal}/> : null}
      <CreateUser onSuccess={() => loadUsers().then()}/>
      <Table dataSource={users} columns={columns} rowKey="_id"/>
    </>
  );
};

export default UsersPage;
