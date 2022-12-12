import { getHash } from './get-hash';

describe('get-hash', () => {

  test('simple', () => {
    expect(getHash('rob@excal.tv', 'simple')).toBe('hash-rob@excal.tv')
  })

  test('md5', () => {
    expect(getHash('rob@excal.tv', 'md5')).toBe('d89a3df64eb6108a8dbc5041070f09e1')
    expect(getHash('robert.porter1@gmail.com', 'md5')).toBe('bcafea9286bc1130f477420c9b0ab82a')
  })

  test('sha256', () => {
    expect(getHash('rob@excal.tv', 'sha256')).toBe('59ae714e6670460d99e4787678539087fcec09f2440aca4b77eea63c23f64c8b')
    expect(getHash('robert.porter1@gmail.com', 'sha256')).toBe('bf2efeb3fe772c9e17f1a3f71d7e6914c174810bf2db1f6f0ca521a6d3ef3937')
  })
})
