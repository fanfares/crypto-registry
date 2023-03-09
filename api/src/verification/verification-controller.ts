import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Network, NodeRecord, VerificationMessageDto, VerificationRequestDto } from '@bcr/types';
import { VerificationService } from './verification.service';
import { MessageSenderService } from '../network/message-sender.service';
import { DbService } from '../db/db.service';
import { VerificationDto } from '../types/verification-response-dto';
import { ApiConfigService } from '../api-config';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { getCurrentNodeForHash } from './get-current-node-for-hash';
import { VerificationRecord } from '../types/verification-db.types';
import { getHash } from '../utils';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {

  constructor(
    private verificationService: VerificationService,
    private messageSenderService: MessageSenderService,
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private logger: Logger
  ) {
  }

  @Post()
  @ApiBody({ type: VerificationRequestDto })
  @ApiResponse({ type: VerificationDto })
  async verify(
    @Body() verificationRequestDto: VerificationRequestDto
  ): Promise<VerificationDto> {
    const nodes = await this.dbService.nodes.find({
      unresponsive: false
    });
    const isConnected = nodes.length > 1;
    // Note that mainnet is hardcoded.  It's just about selecting a random node
    // Hence, it does not matter if we use it for a testnet submission
    const blockHash = await this.bitcoinServiceFactory.getService(Network.mainnet).getLatestBlock();
    let selectedNode: NodeRecord;

    if (isConnected) {
      // todo - remove when we have our email sending accounts
      const bitcoinCustodianRegistry = await this.dbService.nodes.findOne({ address: 'https://bitcoincustodianregistry.org' });
      if (bitcoinCustodianRegistry) {
        selectedNode = bitcoinCustodianRegistry;
      } else if (nodes.length === 2) {
        // select the other one.
        selectedNode = nodes.find(n => n.address !== this.apiConfigService.nodeAddress);
      } else {
        const otherNodes = nodes.filter(n => n.address !== this.apiConfigService.nodeAddress);
        const nodeNumber = getCurrentNodeForHash(blockHash, otherNodes.length);
        selectedNode = otherNodes[nodeNumber - 1];
      }
    } else {
      // Select this node
      selectedNode = nodes[0];
    }

    const verificationRequestMessage: VerificationMessageDto = {
      initialNodeAddress: this.apiConfigService.nodeAddress,
      selectedNodeAddress: selectedNode.address,
      blockHash: blockHash,
      email: verificationRequestDto.email
    };

    if (isConnected) {
      this.messageSenderService.broadcastVerification(verificationRequestMessage)
        .then().catch(err => {
        this.logger.error(err.message, { verificationRequestDto });
      });
    }

    return await this.verificationService.verify(verificationRequestMessage);
  }

  @Get()
  @ApiQuery({ name: 'email' })
  async getVerificationsByEmail(
    @Query('email') email: string
  ): Promise<VerificationDto[]> {
    return this.verificationService.getVerificationsByEmail(email)
  }

}
