import { Injectable } from "@nestjs/common";
import { ApiConfigService } from "../api-config";
import { BitCoinCoreApi } from "./bitcoin-core-api";
import { Network } from "@bcr/types";

@Injectable()
export class BitcoinCoreApiFactory {

  bitcoinCoreTestNetApi: BitCoinCoreApi;
  bitcoinCoreMainNetApi: BitCoinCoreApi;

  constructor(
    apiConfigService: ApiConfigService
  ) {
    this.bitcoinCoreTestNetApi = new BitCoinCoreApi(apiConfigService.bitcoinCoreTestnetConfig);
    this.bitcoinCoreMainNetApi = new BitCoinCoreApi(apiConfigService.bitcoinCoreMainnetConfig);
  }

  getApi(network: Network): BitCoinCoreApi {
    return network === Network.testnet ? this.bitcoinCoreTestNetApi : this.bitcoinCoreMainNetApi;
  }
}
