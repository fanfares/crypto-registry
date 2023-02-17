import { ApiError, CancelablePromise } from '../open-api';

export async function execRequest<bodyT, returnT>(
  fn: (input: bodyT) => CancelablePromise<returnT>,
  inputs: bodyT
): CancelablePromise<returnT> {
  try {
    return fn(inputs);
  } catch (err) {
    let message = err.message;
    if (err instanceof ApiError) {
      message = err.body.message;
    }
    throw new Error(message)
  }
}
