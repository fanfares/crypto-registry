import { Response } from 'express';
import { SignInTokens } from '../types/user.types';

export class RefreshTokenCookies {
  static clear(response: Response) {
    response.cookie(`refresh-token`, '');
    response.cookie(`is-authenticated`, '');
    response.cookie(`refresh-token-expiry`, '');
    response.cookie(`id-token-expiry`, '');
  }

  static set = (response: Response, credentials: SignInTokens ) => {
    if (credentials.idToken) {
      response.cookie(`refresh-token`, credentials.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      });

      response.cookie(`is-authenticated`, true, {
        secure: true,
        sameSite: 'strict'
      });

      response.cookie(`id-token-expiry`, credentials.idTokenExpiry, {
        secure: true,
        sameSite: 'strict'
      });

      response.cookie(`refresh-token-expiry`, credentials.refreshTokenExpiry, {
        secure: true,
        sameSite: 'strict'
      });
    }

  };



}
