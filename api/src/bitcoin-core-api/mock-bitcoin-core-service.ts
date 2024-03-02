import { Injectable } from "@nestjs/common";
import { BitcoinCoreFactoryService } from "./bitcoin-core-factory.service";

@Injectable()
export class MockBitcoinCoreService extends BitcoinCoreFactoryService {

  async getBestBlockHash(): Promise<string> {
    return "BestBlock";
  }
}
