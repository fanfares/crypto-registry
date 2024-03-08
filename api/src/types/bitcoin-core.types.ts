export interface BitcoinCoreRawRequest {
  method: string,
  params?: any[],
}

export interface BitcoinCoreBlock {
  hash: string;
  confirmations: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  time: Date;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: number;
  nTx: number;
  previousblockhash: string;
  nextblockhash: string;
  strippedsize: number;
  size: number;
  weight: number;
  tx: string[];
}
