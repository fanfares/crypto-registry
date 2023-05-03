import { Bip84Account } from './bip84-account';
import { Network } from '@bcr/types';
import { registryMnemonic, testnetRegistryZpub } from './exchange-mnemonic';

describe('bip84 account', () => {
  test('print mainnet exchange zpub', () => {
    const m = 'tide fiscal mention snake diagram silly bottom unique female deliver seat path'
    const account = Bip84Account.fromMnemonic(m, Network.mainnet)
    console.log('mainnet exchange zpub', account.zpub)
    expect(account.zpub).toBe('zpub6qn3Py6TTmUbm2b7KKsuGdYWHUbk8RkYbrx934sJsLQPZBhMfWZaiHcvdbwqatGDrteBoRxaTJC5NfJrnPJSTgSciQBGyiJxzfmu6BPHiG5')
  })

  test('print mainnet registry zpub', () => {
    const m = 'symbol quick short crush address menu inner disease palace radar survey acid'
    const account = Bip84Account.fromMnemonic(m, Network.mainnet)
    console.log('mainnet registry zpub', account.zpub)
  })

  test('print registry zpub', () => {
    const account = Bip84Account.fromMnemonic(registryMnemonic, Network.testnet)
    console.log('Testnet Registry Zpub', account.zpub)
    expect(account.zpub).toBe(testnetRegistryZpub)
  })
})
