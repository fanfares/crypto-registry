export const ADMIN_EMAILS = [
  'robert.porter1@gmail.com',
  'rob@excal.tv'
];

export const isAdmin = (email: string) => {
  return ADMIN_EMAILS.includes(email);
};
