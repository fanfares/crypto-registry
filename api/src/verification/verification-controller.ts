import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { VerificationRequestDto, MessageType, NodeRecord, Network } from '@bcr/types';
import { VerificationService } from './verification.service';
import { MessageSenderService } from '../network/message-sender.service';
import { DbService } from '../db/db.service';
import { VerificationResponseDto } from '../types/verification-response-dto';
import { ApiConfigService } from '../api-config';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { getCurrentNodeForHash } from './get-current-node-for-hash';

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
  @ApiResponse({ type: VerificationResponseDto })
  async verify(
    @Body() verificationRequestDto: VerificationRequestDto
  ): Promise<VerificationResponseDto> {
    const otherNodes = await this.dbService.nodes.find({
      address: { $ne: this.apiConfigService.nodeAddress },
      unresponsive: false
    });
    const isConnected = otherNodes.length > 0;
    let selectedNode: NodeRecord;
    if (isConnected) {
      // const bitcoinCustodianRegistry = await this.dbService.nodes.findOne({address: 'https://bitcoincustodianregistry.org'});
      // if ( bitcoinCustodianRegistry) {
      //   selectedNode = bitcoinCustodianRegistry
      // } else {
      //   const nodesExLocal = nodes.filter(n => n.address !== this.apiConfigService.nodeAddress)
      //   selectedNode = nodesExLocal[Math.floor(Math.random() * nodesExLocal.length)];
      // }

      if (otherNodes.length === 1) {
        selectedNode = otherNodes[0]
      } else {
        // Note that mainnet is hardcoded.  It's just about selecting a random node, so it doesn't matter.
        const blockHash = await this.bitcoinServiceFactory.getService(Network.mainnet).getLatestBlock();
        const nodeNumber = getCurrentNodeForHash(blockHash, otherNodes.length);
        selectedNode = otherNodes[nodeNumber - 1];
      }

      this.messageSenderService.sendDirectMessage(selectedNode.address, MessageType.verify, JSON.stringify(verificationRequestDto))
        .then().catch(err => {
        this.logger.error(err.message, { verificationRequestDto });
      });
    } else {
      selectedNode = otherNodes[0];
    }
    await this.verificationService.verify(verificationRequestDto, !isConnected);
    return { selectedEmailNode: selectedNode.nodeName };
  }
}
