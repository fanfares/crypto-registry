import arrayBufferToHex from 'array-buffer-to-hex';

export const calculateSha256Hash = async (data: string) => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hash265 = await crypto.subtle.digest('SHA-256', encoded);
  return arrayBufferToHex(hash265);
};
