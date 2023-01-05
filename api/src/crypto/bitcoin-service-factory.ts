import { Injectable } from '@nestjs/common';
import { Network } from '@bcr/types';
import { BitcoinService } from './bitcoin.service';

@Injectable()
export class BitcoinServiceFactory {
  private services = new Map<Network, BitcoinService>();

  public setService(network: Network, service: BitcoinService) {
    this.services.set(network, service);
  }

  public getService(network: Network) {
    return this.services.get(network);
  }
}
