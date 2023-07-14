import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiConfigService } from "../api-config";

const format = Intl.NumberFormat('en-GB', {maximumSignificantDigits: 3});

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  constructor(
    @Inject('sync-logger') private logger: Logger,
    private apiConfigService: ApiConfigService) {
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodName = context.getHandler().name;
    const controllerName = context.getClass().name;
    const start = new Date().getTime();
    const request = context.switchToHttp().getRequest();
    const requestInputs = {...request.body, ...request.params};
    if (Object.getOwnPropertyNames(requestInputs).length > 0) {
      this.logger.log(`${this.apiConfigService.nodeName}:${methodName} in ${controllerName} invoked`, {
        method: request.method,
        ...requestInputs
      });
    } else {
      this.logger.log(`${this.apiConfigService.nodeName}:${methodName} in ${controllerName} invoked`);
    }
    return next
      .handle()
      .pipe(
        tap(() => {
          const elapsed = new Date().getTime() - start;
          this.logger.log(`${this.apiConfigService.nodeName}:${methodName} in ${controllerName} completed in ${format.format(elapsed)}ms`);
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
            description: `${this.apiConfigService.nodeName}:${methodName} in ${controllerName} failed`
          });
          return throwError(err);
        })
      );
  }
}
