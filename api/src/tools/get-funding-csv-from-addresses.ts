import { SignedAddress } from '../crypto';

export function getFundingCsvFromAddresses(signedAddresses: SignedAddress[]) {
  let data = 'message, address, signature\n';
  for (const signedAddress of signedAddresses) {
    data += `${signedAddress.message},${signedAddress.address},${signedAddress.signature}\n`;
  }
  return data;
}
