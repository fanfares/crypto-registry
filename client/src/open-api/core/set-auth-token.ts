import { OpenAPIConfig } from './OpenAPI';
import { isAfter, isBefore, parseISO } from 'date-fns';
import { CredentialsDto } from '../models/CredentialsDto';

export async function setAuthTokens(config: OpenAPIConfig) {

  config.TOKEN = localStorage.getItem('token') ?? undefined;
  const tokenExpiry = localStorage.getItem('token-expiry') ?? undefined;

  if (tokenExpiry) {
    if (isBefore(new Date(), parseISO(tokenExpiry))) {
      const res = await fetch('/api/user/refresh-token', {
        method: 'POST'
      });
      const data: CredentialsDto = await res.json();
      localStorage.setItem('token-expiry', data.idTokenExpiry);
      localStorage.setItem('token', data.idToken);
      config.TOKEN = data.idToken;
    }
  }
}
