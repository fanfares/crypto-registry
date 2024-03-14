import { validateHoldings } from './validate-holdings';
import { v4 as uuid } from 'uuid';

describe('validate holdings', () => {
  test('valid', () => {
    expect(() => validateHoldings([{
      exchangeUid: uuid(),
      amount: 1000,
      hashedEmail: 'dfjkdkjvdnkn'
    }])).not.toThrow();
  })

  test('invalid', () => {
    expect(() => validateHoldings([{
      exchangeUid: 'invalid-uis',
      amount: 1000,
      hashedEmail: 'dfjkdkjvdnkn'
    }])).toThrow();
  })

  test('ignore missing', () => {
    expect(() => validateHoldings([{
      amount: 1000,
      hashedEmail: 'dfjkdkjvdnkn'
    }])).not.toThrow();
  })

  test('missing uid or hashed email', () => {
    expect(() => validateHoldings([{
      amount: 1000,
    }])).toThrow();
  })
})
