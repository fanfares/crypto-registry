export const validatePasswordRules = (password: string) => {
  // Returns null if no error
  // Otherwise returns error message
  if (password === null || password === '') {
    return 'Password required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!(/[A-Z]/).test(password) ||
    !(/[a-z]/).test(password) ||
    !(/[0-9]/).test(password)
  ) {
    return 'Password must contain a lower case letter, an upper case letter and a number';
  }
  if (password.toLowerCase().includes('password')) {
    return 'Your password cannot contain "password"!';
  }
  return null;
};
