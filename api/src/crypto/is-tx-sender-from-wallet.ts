import { BitcoinService, Transaction } from './bitcoin.service';
import { isAddressFromWallet } from './is-address-from-wallet';

export const isTxSenderFromWallet = (
  bitcoinService: BitcoinService,
  tx: Transaction,
  senderZpub: string
) => {
  const sendingAddresses = tx.inputs.map(input => input.address);
  for (const sendingAddress of sendingAddresses) {
    if (isAddressFromWallet(bitcoinService, sendingAddress, senderZpub)) {
      return true
    }
  }
  return false
}

