import { processHoldingsFile } from './process-holdings-file';
import { v4 as uuidv4 } from 'uuid';

describe('process-holdings-file', () => {

  test('standard headers', async () => {
    const headers = 'email,amount';
    const data = 'hash,1000';
    const file = Buffer.from(headers + '\n' + data);

    const result = await processHoldingsFile(file);
    expect(result[0].hashedEmail).toBe('hash');
    expect(result[0].amount).toBe(1000);
  });

  test('headers in reverse order', async () => {
    const headers = 'amount,email';
    const data = '1000,hash';
    const file = Buffer.from(headers + '\n' + data);

    const result = await processHoldingsFile(file);
    expect(result[0].hashedEmail).toBe('hash');
    expect(result[0].amount).toBe(1000);
  });

  test('headers in upper case', async () => {
    const headers = 'Amount,Email';
    const data = '1000,hash';
    const file = Buffer.from(headers + '\n' + data);

    const result = await processHoldingsFile(file);
    expect(result[0].hashedEmail).toBe('hash');
    expect(result[0].amount).toBe(1000);
  });

  test('trim values', async () => {
    const headers = ' Amount , Email ';
    const data = ' 1000 , hash ';
    const file = Buffer.from(headers + '\n' + data);

    const result = await processHoldingsFile(file);
    expect(result[0].hashedEmail).toBe('hash');
    expect(result[0].amount).toBe(1000);
  });

  test('include exchange uid', async () => {
    const headers = 'amount,email,uid';
    const exchangeUid = uuidv4();
    const data = '1000,hash,' + exchangeUid;
    const file = Buffer.from(headers + '\n' + data);

    const result = await processHoldingsFile(file);
    expect(result[0].hashedEmail).toBe('hash');
    expect(result[0].amount).toBe(1000);
    expect(result[0].exchangeUid).toBe(exchangeUid);
  });
});
1;
