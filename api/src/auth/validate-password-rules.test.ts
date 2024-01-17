import { validatePasswordRules } from './validate-password-rules';

describe('validatePassword', () => {
  test('password required', () => {
    const error = validatePasswordRules('');
    expect(error).toBe('Password required');
  });

  test('min 8 characters', () => {
    const error = validatePasswordRules('123');
    expect(error).toBe('Password must be at least 8 characters long');
  });

  test('lower case letter required', () => {
    const error = validatePasswordRules('ABCDEF01');
    expect(error).toBe('Password must contain a lower case letter, an upper case letter and a number');
  });

  test('upper case letter required', () => {
    const error = validatePasswordRules('abcdef01');
    expect(error).toBe('Password must contain a lower case letter, an upper case letter and a number');
  });

  test('number required', () => {
    const error = validatePasswordRules('abcdEFGH');
    expect(error).toBe('Password must contain a lower case letter, an upper case letter and a number');
  });

  test('password cannot contain "password"', () => {
    const error = validatePasswordRules('Password01');
    expect(error).toBe('Your password cannot contain "password"!');
  });

  test('valid password', () => {
    const error = validatePasswordRules('Valid123');
    expect(error).toBeNull();
  });
});

