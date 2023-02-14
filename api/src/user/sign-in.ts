import * as jwt from 'jsonwebtoken';
import { addSeconds } from 'date-fns';
import { SignInTokens, UserRecord } from '../types/user.types';

export const createSignInCredentials = async (
  user: UserRecord,
  jwtSigningSecret: string
): Promise<SignInTokens> => {
  const payload: JwtPayload  = { userId: user._id };

  const idTokenExpiryInSeconds = 3600; // 1 hour
  const now = new Date();
  const idTokenExpiry = addSeconds(now, idTokenExpiryInSeconds).toISOString();
  const refreshTokenExpiryInSeconds = 2592000; // 1 month
  const refreshTokenExpiry = addSeconds(now, refreshTokenExpiryInSeconds).toISOString();

  const idToken = jwt.sign(payload, jwtSigningSecret, {
    expiresIn: idTokenExpiryInSeconds,
    algorithm: 'HS256'
  });

  const refreshToken = jwt.sign(payload, jwtSigningSecret, {
    expiresIn: refreshTokenExpiryInSeconds,
    algorithm: 'HS256'

  });

  return {
    idToken,
    refreshToken,
    idTokenExpiry,
    refreshTokenExpiry,
    userId: user._id
  };
};
