import { ApiError } from '../open-api/core/ApiError.ts';

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if ( err.body ) {
      return err.body.message ?? err.message
    } else {
      return err.message;
    }
  }  else if ( err instanceof Error ) {
    return err.message;
  } else {
    // You can return a default error message or perform other checks here
    return 'An unknown error occurred';
  }
}
