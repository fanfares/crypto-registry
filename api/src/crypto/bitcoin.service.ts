import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BitcoinService {
  abstract getBalance(address: string): Promise<number>;
}
