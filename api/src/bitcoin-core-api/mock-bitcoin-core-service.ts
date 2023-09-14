import { Injectable } from "@nestjs/common";
import { BitcoinCoreService } from "./bitcoin-core-service";

@Injectable()
export class MockBitcoinCoreService extends BitcoinCoreService {

  async getBestBlockHash(): Promise<string> {
    return "BestBlock";
  }
}
