import { CryptoService } from './crypto.service';

export enum Coin {
  bitcoin = 'bitcoin',
}

export type Key = 'exchange-1' | 'exchange-2' | 'crypto-registry';

interface Account {
  key: Key;
  balance: number;
  coin: Coin;
}

interface Transaction {
  fromKey: Key;
  toKey: Key;
  amount: number;
}

const accounts: Account[] = [
  {
    key: 'exchange-1',
    balance: 100,
    coin: Coin.bitcoin,
  },
  {
    key: 'exchange-2',
    balance: 200,
    coin: Coin.bitcoin,
  },
  {
    key: 'crypto-registry',
    balance: 50,
    coin: Coin.bitcoin,
  },
];

const transactions: Transaction[] = [
  {
    fromKey: 'exchange-1',
    toKey: 'crypto-registry',
    amount: 10,
  },
];

export class MockCryptoService extends CryptoService {
  async getTransaction(fromKey: string, toKey: string): Promise<number> {
    const txs = transactions.filter(
      (t) => t.fromKey === fromKey && t.toKey === toKey,
    );
    return txs.reduce((txTotal, tx) => {
      return txTotal + tx.amount;
    }, 0);
  }

  async getBalance(key: string): Promise<number> {
    const account = accounts.find((account) => account.key === key);
    return account?.balance ?? 0;
  }
}
