import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from './user.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  constructor(private userService: UserService) {}

  async use(request: Request, res: Response, next: NextFunction) {
    const idToken = request.header('Authorization')?.replace('Bearer ', '');
    if (!idToken) {
      return res.status(403).json({
        statusCode: 403,
        message: `You must be authenticated to use this route ${request.originalUrl}`
      });
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
      request['user'] = user
    }

    next();
  }
}
