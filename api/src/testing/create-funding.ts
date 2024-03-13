import { WalletService } from '../bitcoin-service';
import { Bip84Utils } from '../crypto';

export const createFunding = async (
  walletService: WalletService,
  extendedPublicKey: string,
  addresses: number
) => {

  const wallet = Bip84Utils.fromExtendedKey(extendedPublicKey);
  for (let i = 0; i < addresses; i++) {
    const address = wallet.getAddress(i, false);
    await walletService.sendFunds(address, 1000 * i);
  }
};
