import { isAfter, parseISO } from 'date-fns';
import { CredentialsDto } from '../models/CredentialsDto';

export async function setAuthTokens() {
  const tokenExpiry = localStorage.getItem('token-expiry') ?? undefined;

  if (tokenExpiry && isAfter(new Date(), parseISO(tokenExpiry))) {
    const res = await fetch('/api/auth/refresh-token', {
      method: 'POST'
    });
    if (res.ok) {
      const data: CredentialsDto = await res.json();
      localStorage.setItem('token-expiry', data.idTokenExpiry);
    } else {
      throw new Error('token refresh failed')
    }
  }
}
