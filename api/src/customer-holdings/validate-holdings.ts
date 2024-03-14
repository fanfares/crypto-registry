import { CustomerHoldingDto } from '@bcr/types';
import { validate } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export function validateHoldings(holdings: CustomerHoldingDto[]) {
  holdings.forEach(holding => {
    if (!holding.exchangeUid && !holding.hashedEmail ) {
      throw new BadRequestException('Holding must contain at least one of uid or hashed email');
    }
    if (holding.exchangeUid && !validate(holding.exchangeUid)) {
      throw new BadRequestException('Invalid UID: ' + holding.exchangeUid);
    }
  });
}
