import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from './user.service';
import { NextFunction, Request, Response } from 'express';
import { createVerify } from 'crypto';
import { differenceInMinutes, parseISO } from 'date-fns';

export interface MessageType {
  timestamp: string;
  randomText: string;
  path: string;
  email: string;
}

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {


  constructor(private userService: UserService) {
  }

  private async authenticateApiKey(request: Request, next: NextFunction) {
    const messageStr = request.header('x-auth-nonce');
    const signature = request.header('x-auth-signature');

    const message: MessageType = JSON.parse(messageStr);
    const user = await this.userService.getUserByEmail(message.email);
    if (!user) {
      throw new ForbiddenException();
    }
    if ( !user.publicKey ) {
      throw new ForbiddenException();
    }

    if (differenceInMinutes(parseISO(message.timestamp), new Date()) > 1) {
      throw new ForbiddenException('Timestamp out of date');
    }

    // const publicKeyBase64 = 'LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJDZ0tDQVFFQXBGcU9wcTI1R3lzY1QxeS9jQ0tEOFNCN2tQWkYyNGdKUXkxNFNlVTMyQ3ZWTUxsa3F2Y0gKQ3BYY2xmbnNETXE0THBUaHcvMWZtNllDeW96a09xMWhYTHAzdmVxU3BJQW1ZeTc3OGMzSHhsSEE5V3dvRWNBaQp0Z0g4K0NLeXB1cWExWmY0YVdoZkxQQ3RsTW1MOWRHZFY4Y0pMWW0rRFBWWHlxSHJrRmhGL09aRnJBTHBCOHRoCk5wVjBMWHlqZW9EQmVzMEI4WDgwalYxVFJHN0ptZ3FVUTFJS0lBRS9zUE1iQVc4bUZWcmxjQWllQ2NZYzR6TjYKTmVrUlhDQk1WMHdXQmhRRUlESExSUXUyVXJsODRKaUlmWldSd253eU93ZHdZYzEwbG5JVWZNaGtRM3VjRkpJUQo2ejIyUFJHMTZhYkdJUllXUkxyczNEWHcydE9OM0RuRWd3SURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K';
    const publicKey = Buffer.from(user.publicKey, 'base64').toString('ascii');

    const verify = createVerify('SHA256');
    verify.write(messageStr);
    verify.end();
    const verified = verify.verify(publicKey, signature, 'hex');

    if (verified) {
      request['user'] = user;
      next();
    } else {
      throw new ForbiddenException('Not authenticated');
    }
  }

  async use(request: Request, res: Response, next: NextFunction) {
    if (request.header('x-auth-nonce')) {
      await this.authenticateApiKey(request, next);
      return;
    }

    const idToken = request.header('Authorization')?.replace('Bearer ', '');
    if (!idToken) {
      return res.status(403).json({
        statusCode: 403,
        message: `You must be authenticated to use this route ${request.originalUrl}`
      });
      // todo - throw new ForbiddenException();
    }
    const refreshToken = request.cookies['refresh-token'];
    if (!refreshToken) {
      return res.status(403).json({
        statusCode: 403,
        message: `You must be authenticated to use this route ${request.originalUrl}`
      });
    }
    const user = await this.userService.getUserByToken(idToken);

    if (user) {
      request['user'] = user;
    }

    next();
  }
}
