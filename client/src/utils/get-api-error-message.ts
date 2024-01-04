import { ApiError } from '../open-api/core';

export function getApiErrorMessage(err: ApiError) {
  if (err.body?.message) {
    return err.body.message;
  } else if (err.statusText) {
    return err.statusText;
  } else {
    return err.toString();
  }
}
