import { OpenAPIConfig } from './OpenAPI';
import { isAfter, parseISO } from 'date-fns';
import { CredentialsDto } from '../models/CredentialsDto';

export async function setAuthTokens(config: OpenAPIConfig) {
  if (!config.TOKEN) {
    config.TOKEN = localStorage.getItem('token') ?? undefined;
    if (config.TOKEN) {
      config.TOKEN_EXPIRY = localStorage.getItem('token-expiry') ?? undefined;
    }
  }

  if (config.TOKEN_EXPIRY) {
    if (isAfter(new Date(), parseISO(config.TOKEN_EXPIRY))) {
      const res = await fetch('/api/user/refresh-token', {
        method: 'POST'
      });
      const data: CredentialsDto = await res.json();
      config.TOKEN_EXPIRY = data.idTokenExpiry;
      config.TOKEN = data.idToken;
    }
  }
}
