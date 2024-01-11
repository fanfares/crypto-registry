export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  } else {
    // You can return a default error message or perform other checks here
    return 'An unknown error occurred';
  }
}
