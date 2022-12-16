import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';

export const testMnemonic = 'express ice hill wife creek season cattle rally excess jungle envelope loyal ship arm lyrics scorpion omit audit breeze butter year gym prepare nothing';
export const testWalletMnemonic = 'ecology potato outdoor effort manage pudding stand goose access library tongue link';
export const wallet2Mnemonic = 'dad license consider endorse tent menu program north account liberty gym pond';

export const exchangeMnemonic = testWalletMnemonic;
export const registryMnemonic = wallet2Mnemonic;
export const faucetMnemonic = testMnemonic;

console.log('registry zpub', getZpubFromMnemonic(registryMnemonic, 'password', 'testnet'));
console.log('exchange zpub', getZpubFromMnemonic(exchangeMnemonic, 'password', 'testnet'));
