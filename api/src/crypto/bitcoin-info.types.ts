export interface Input {
  prev_out: {
    addr: string;
    value: number;
  };
}

export interface Output {
  value: number;
  addr: string;
}

export interface Transaction {
  hash: string;
  fee: number;
  inputs: Input[];
  out: Output[];
}

export interface RawAddr {
  address: string;
  final_balance: number;
  txs: Transaction[];
}
