export async function retryWithBackoff<T>  (
  retryFunction: () => Promise<T>,
  maxRetries = 5,
  delay = 1000
): Promise<T> {
  let attempts = 0;

  const attempt = async (): Promise<T> => {
    try {
      return await retryFunction();
    } catch (error) {
      if (++attempts >= maxRetries) {
        throw error;
      }
      return new Promise<T>((resolve) =>
        setTimeout(() => resolve(attempt()), delay * Math.pow(2, attempts))
      );
    }
  };

  return attempt();
}
