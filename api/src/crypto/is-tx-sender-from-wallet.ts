import { OutputAddress, Transaction } from './bitcoin.service';
import { isAddressFromWallet } from './is-address-from-wallet';

export class OutputAddressAnalyser {

  senderBalance = 0;
  hasRequiredSenderBalance: boolean;
  hasSenderMismatch: boolean

  constructor(
    outputAddresses: OutputAddress[],
    senderZpub: string,
    requiredBalance: number
  ) {
    for (const outputAddress of outputAddresses) {
      if (isAddressFromWallet(outputAddress.address, senderZpub)) {
        this.senderBalance += outputAddress.value
      } else {
        this.hasSenderMismatch = true
      }
    }
    this.hasRequiredSenderBalance = this.senderBalance > requiredBalance;
  }
}

export const isTxSenderFromWallet = (
  tx: Transaction,
  senderZpub: string
) => {
  const sendingAddresses = tx.inputs.map(input => input.address);
  for (const sendingAddress of sendingAddresses) {
    if (isAddressFromWallet(sendingAddress, senderZpub)) {
      return true
    }
  }
  return false
}

export const isTxsSendersFromWallet = (
  txs: Transaction[],
  senderZpub: string
) => {
  for (const tx of txs) {
    if (isTxSenderFromWallet(tx, senderZpub)) {
      return true
    }
  }
  return false
}
