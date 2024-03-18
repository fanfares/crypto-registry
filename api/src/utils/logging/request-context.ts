import { createHook, executionAsyncId } from 'async_hooks';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

class RequestContext {
  store: any = new Map();
  asyncHook: any;

  init() {
    this.asyncHook = createHook({
      init: (asyncId, _, triggerAsyncId) => {
        if (this.store.has(triggerAsyncId)) {
          this.store.set(asyncId, this.store.get(triggerAsyncId));
        }
      },
      destroy: (asyncId) => {
        if (this.store.has(asyncId)) {
          this.store.delete(asyncId);
        }
      }
    });
    this.asyncHook.enable();
  }

  setContext(contextId: string) {
    this.store.set(executionAsyncId(), contextId);
  }

  getRequestContext = () => {
    return this.asyncHook ? this.store.get(executionAsyncId()) : undefined;
  };
}

export const assignRequestContext = (request: Request,
                                     response: Response,
                                     next: NextFunction) => {
  const contextId = uuid();
  requestContext.setContext(contextId);
  next();
};

export const requestContext = new RequestContext();
