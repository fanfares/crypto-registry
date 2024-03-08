import { CallHandler, ExecutionContext, Injectable, LoggerService, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const format = Intl.NumberFormat('en-GB', {maximumSignificantDigits: 3});

const obscureSensitiveParams = (params: any) => {
  const ret = {...params};
  const obscuredParams = ['password'];
  for (const obscuredParam of obscuredParams) {
    if (params[obscuredParam]) {
      ret[obscuredParam] = '*** ' + obscuredParam + ' ***';
    }
  }
  return ret;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  constructor(
    private logger: LoggerService
  ) {
  }


  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodName = context.getHandler().name;
    const controllerName = context.getClass().name;
    const start = new Date().getTime();
    const request = context.switchToHttp().getRequest();
    const requestInputs = obscureSensitiveParams({...request.body, ...request.params});
    let info: any = {
      method: request.method,
    };
    if (request.headers['app-version']) {
      info = {
        ...info,
        appVersion: request.headers['app-version']
      };
    }

    if (request['user']) {
      info = {...info, user: request['user']};
    }

    if (Object.getOwnPropertyNames(requestInputs).length > 0) {
      info = {...info, ...requestInputs};
    }
    this.logger.log(`${methodName} in ${controllerName} invoked`, info);
    return next
    .handle()
    .pipe(
      tap(() => {
        const elapsed = new Date().getTime() - start;
        this.logger.log(`${methodName} in ${controllerName} completed in ${format.format(elapsed)}ms`);
      }),
      catchError(err => {
        const request = context.switchToHttp().getRequest();
        const info: any = {};
        if (request.user) {
          info.user = request.user;
        }
        if (request.originalUrl) {
          info.originalUrl = request.originalUrl;
        }
        if (request.method) {
          info.method = request.method;
        }
        if (request.body) {
          info.body = obscureSensitiveParams(request.body);
        }
        if (request.headers?.origin) {
          info.origin = request.headers.origin;
        }
        if (err.stack) {
          info.stack = err.stack;
        }
        if (err.status) {
          info.status = err.status;
        }
        if (err?.downgradeTo) {
          this.logger.log(err?.downgradeTo, `${methodName} in ${controllerName} failed: ${err}`, info);
        } else {
          this.logger.error(err, {...info, description: `${methodName} in ${controllerName} failed`});
        }

        return throwError(err);
      })
    );
  }
}
