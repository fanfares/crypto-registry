export interface Store {
  errorMessage: string | null;
  setErrorMessage(errorMessage: string): void;
}

