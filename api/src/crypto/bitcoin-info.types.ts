export interface BitcoinInfoInput {
  prev_out: {
    addr: string;
    value: number;
  };
}

export interface BitcoinInfoOutput {
  value: number;
  addr: string;
}

export interface BitcoinInfoTransaction {
  hash: string;
  fee: number;
  inputs: BitcoinInfoInput[];
  out: BitcoinInfoOutput[];
}

export interface BitcoinInfoRawAddr {
  address: string;
  final_balance: number;
  txs: BitcoinInfoTransaction[];
}
