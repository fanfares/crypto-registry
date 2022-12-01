import { CryptoService } from './crypto.service';
import { Coin } from '../types/coin.type';
import { Transaction } from '../types/transaction.type';

export type Key = 'exchange-1' | 'exchange-2' | 'crypto-registry';

interface TestAccount {
  key: Key;
  balance: number;
  coin: Coin;
}

const accounts: TestAccount[] = [{
  key: 'exchange-1',
  balance: 100,
  coin: Coin.bitcoin
}, {
  key: 'exchange-2',
  balance: 200,
  coin: Coin.bitcoin
}, {
  key: 'crypto-registry',
  balance: 50,
  coin: Coin.bitcoin
}];

const transactions: Transaction[] = [{
  fromKey: 'exchange-1',
  toKey: 'crypto-registry',
  coin: Coin.bitcoin,
  amount: 100
}
];

export class MockCryptoService extends CryptoService {
  async getTransactions(
    fromKey: string,
    toKey: string
  ): Promise<Transaction[]> {
    return transactions.filter(
      (t) => t.fromKey === fromKey && t.toKey === toKey
    );
  }

  async getBalance(
    key: string
  ): Promise<number> {
    const account = accounts.find((account) => account.key === key);
    return account?.balance ?? 0;
  }
}
