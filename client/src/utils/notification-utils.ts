import { NotificationInstance } from 'antd/es/notification/interface';

let notificationApi: NotificationInstance | null = null;

export const setNotificationApi = (api: NotificationInstance) => {
  notificationApi = api;
};


export const errorNotification = (error: string) => {
  if (notificationApi) {
    notificationApi['error']({
      message: 'Operation Failed',
      description: error
    });
  }
};

export const successNotification = (message: string) => {
  if (notificationApi) {
    notificationApi['success']({
      message: 'Operation Succeeded',
      description: message
    });
  }
};
