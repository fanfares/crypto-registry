import { isAddressFromWallet } from './is-address-from-wallet';
import { Transaction } from '@bcr/types';

export const isTxSenderFromWallet = (
  tx: Transaction,
  senderZpub: string
) => {
  const sendingAddresses = tx.inputs.map(input => input.address);
  for (const sendingAddress of sendingAddresses) {
    if (isAddressFromWallet(sendingAddress, senderZpub)) {
      return true;
    }
  }
  return false;
};

