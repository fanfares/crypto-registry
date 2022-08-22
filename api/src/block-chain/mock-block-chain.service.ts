
export class MockBlockChainService {
  async isPaymentMade(custodianPublicKey: string) {
    return true;
  }

  async getCurrentBalance(publicKey: string): Promise<number> {
    return 100;
  }
}
