import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CustodianService } from '../db/custodian.service';
import { CustodianRecord } from '@bcr/types';

@Controller('custodian')
export class CustodianController {


  constructor(
    private custodianService: CustodianService) {
  }

  @Get()
  @ApiResponse({type: CustodianRecord, isArray: true})
  getAllCustodians(): Promise<CustodianRecord[]> {
    return this.custodianService.find({});
  }

}
