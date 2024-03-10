import { isValidEmail } from './is-valid-email.ts';

export function isValidUuidV4(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export function validateUidOrEmail(value: string){
  if (isValidUuidV4(value) || isValidEmail(value)) {
    return true;
  } else {
    return "Email is invalid"
  }
}
