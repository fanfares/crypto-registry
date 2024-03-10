import { processAddressFile } from './process-address-file';

describe('process-address-file', () => {

  test('standard headers', async () => {
    const headers = 'message,address,signature';
    const data = 'm, a, s'
    const file = Buffer.from(headers + '\n' + data);

    const result = await processAddressFile(file);
    expect(result[0].message).toBe('m')
    expect(result[0].address).toBe('a')
    expect(result[0].signature).toBe('s')
  })

  test('headers in reverse order', async () => {
    const headers = 'address,signature,message';
    const data = 'a, s, m'
    const file = Buffer.from(headers + '\n' + data);

    const result = await processAddressFile(file);
    expect(result[0].message).toBe('m')
    expect(result[0].address).toBe('a')
    expect(result[0].signature).toBe('s')
  })

  test('headers in upper case', async () => {
    const headers = 'Address,Signature,Message';
    const data = 'a, s, m'
    const file = Buffer.from(headers + '\n' + data);

    const result = await processAddressFile(file);
    expect(result[0].message).toBe('m')
    expect(result[0].address).toBe('a')
    expect(result[0].signature).toBe('s')
  })

  test('trim values', async () => {
    const headers = ' Address , Signature , Message ';
    const data = ' a , s , m '
    const file = Buffer.from(headers + '\n' + data);

    const result = await processAddressFile(file);
    expect(result[0].message).toBe('m')
    expect(result[0].address).toBe('a')
    expect(result[0].signature).toBe('s')
  })
})
