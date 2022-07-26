import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { CustodianWalletService } from './custodian-wallet.service';
import {
  CustodianWalletRecord,
  CustomerHoldingBase,
  UserIdentity,
  RegisterCustodianWalletDto,
  CustomerHolding,
  WalletStatus
} from '@bcr/types';
import { CustomerHoldingService } from '../customer-holding';

@ApiTags('custodian-wallet')
@Controller('custodian-wallet')
export class CustodianWalletController {
  constructor(private custodianWalletService: CustodianWalletService,
              private customerHoldingService: CustomerHoldingService
  ) {
  }

  @Get()
  @ApiResponse({type: CustodianWalletRecord, isArray: true})
  getAllCustodians(): Promise<CustodianWalletRecord[]> {
    return this.custodianWalletService.find({});
  }

  @Post()
  @ApiBody({type: RegisterCustodianWalletDto})
  async registerCustodianWallet(
    @Body() body: RegisterCustodianWalletDto
  ): Promise<void> {

    const creatorIdentity: UserIdentity = {
      type: 'custodian',
      id: 'tbc'
    };

    // todo - search for a transaction with csr public key
    // todo - if valid, then validate that the total customer holdings add up to the wallet balance.

    const totalCustomerHoldings = body.customerHoldings.reduce((total: number, next: CustomerHolding) => {
      total += next.amount;
      return total;
    }, 0);

    let custodianWallet = await this.custodianWalletService.findOne({
      publicKey: body.publicKey
    });
    let custodianWalletId: string;

    if (!custodianWallet) {
      custodianWalletId = await this.custodianWalletService.insert({
        custodianName: body.custodianName,
        status: WalletStatus.PENDING,
        publicKey: body.publicKey,
        customerBalance: totalCustomerHoldings
      }, creatorIdentity);
    } else {
      custodianWalletId = custodianWallet._id;
      await this.custodianWalletService.update(custodianWalletId, {
        customerBalance: totalCustomerHoldings,
        custodianName: body.custodianName,
        status: WalletStatus.PENDING,
        publicKey: body.publicKey
      }, creatorIdentity);
    }

    await this.customerHoldingService.deleteMany({
      custodianWalletId
    }, creatorIdentity);

    const inserts: CustomerHoldingBase[] = body.customerHoldings.map(holding => ({
      hashedEmail: holding.hashedEmail,
      amount: holding.amount,
      custodianWalletId: custodianWalletId
    }));

    await this.customerHoldingService.insertMany(inserts, creatorIdentity);

  }
}
