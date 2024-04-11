import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
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

const methodsToExclude = [
  'systemTest'
];

@Injectable()
export class InterceptLogger implements NestInterceptor {
  private logger = new Logger(InterceptLogger.name);

  constructor() {
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodName = context.getHandler().name;
    const controllerName = context.getClass().name;
    const start = new Date().getTime();
    const request = context.switchToHttp().getRequest();
    const isSSE = request.headers['accept'] === 'text/event-stream';
    let requestInputs: any = {};
    if (!(request.originalUrl === '/api/funding-submission' && request.method === 'post')) {
      requestInputs = obscureSensitiveParams({...request.body, ...request.params});
    }
    if (!methodsToExclude.includes(methodName)) {
      if (Object.getOwnPropertyNames(requestInputs).length > 0) {
        this.logger.log(`${methodName} in ${controllerName} invoked (${request.originalUrl})`, {
          method: request.method,
          ...requestInputs
        });
      } else {
        this.logger.log(`${methodName} in ${controllerName} invoked (${request.originalUrl})`);
      }
    }
    return next
    .handle()
    .pipe(
      tap(() => {
        if (!methodsToExclude.includes(methodName)) {
          const elapsed = new Date().getTime() - start;
          if (isSSE) {
            this.logger.log(`${methodName} in ${controllerName} sse event in ${format.format(elapsed)}ms`);
          } else {
            this.logger.log(`${methodName} in ${controllerName} completed in ${format.format(elapsed)}ms`);
          }
        }
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
          info.body = request.body;
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
        this.logger.error(err, {
          ...info,
          description: `${methodName} in ${controllerName} failed`
        });
        return throwError(err);
      })
    );
  }
}
