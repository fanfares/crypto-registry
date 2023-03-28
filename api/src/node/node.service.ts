import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Network, Node, NodeDto, NodeRecord, SyncRequestMessage } from '@bcr/types';
import { EventGateway } from '../network/event.gateway';
import { getCurrentNodeForHash } from '../verification/get-current-node-for-hash';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { SignatureService } from '../authentication/signature.service';
import { OnlyFieldsOfType } from 'mongodb';

@Injectable()
export class NodeService implements OnModuleInit {

  constructor(
    private db: DbService,
    private apiConfigService: ApiConfigService,
    private eventGateway: EventGateway,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private logger: Logger,
    private messageAuthService: SignatureService
  ) {
  }

  async getNodeDtos(): Promise<NodeDto[]> {
    return (await this.db.nodes.find({})).map(node => ({
      ...node,
      isLocal: node.address === this.apiConfigService.nodeAddress
    }));
  }

  async getLocalNode(): Promise<NodeDto> {
    const node = await this.db.nodes.findOne({
      address: this.apiConfigService.nodeAddress
    });
    return { ...node, isLocal: true };
  }

  public async addNode(node: Node): Promise<NodeRecord> {
    let nodeRecord = await this.db.nodes.findOne({ address: node.address });
    if (!nodeRecord) {
      const id = await this.db.nodes.insert(node);
      nodeRecord = await this.db.nodes.get(id);
    }
    this.eventGateway.emitNodes(await this.getNodeDtos());
    return nodeRecord;
  }

  async removeNode(nodeToRemoveAddress: string) {
    if (this.apiConfigService.nodeAddress === nodeToRemoveAddress) {
      throw new BadRequestException('Cannot remove local node');
    } else {
      await this.db.nodes.deleteMany({
        address: nodeToRemoveAddress
      });
    }
    this.eventGateway.emitNodes(await this.getNodeDtos());
  }

  async getNodeByAddress(address: string): Promise<NodeRecord> {
    return await this.db.nodes.findOne({ address });
  }

  async getThisNode(): Promise<NodeRecord> {
    return await this.getNodeByAddress(this.apiConfigService.nodeAddress);
  }

  async lockThisNode(sourceNodeAddress: string): Promise<boolean> {
    const thisNode = await this.getThisNode();
    if (thisNode.isSynchronising) {
      return false;
    }
    await this.db.nodes.update(thisNode._id, {
      isSynchronising: true,
      synchronisingSourceNode: sourceNodeAddress
    });
  }

  async unlockThisNode() {
    const thisNode = await this.getThisNode();
    await this.db.nodes.update(thisNode._id, {
      isSynchronising: false,
      synchronisingSourceNode: null
    });
  }

  async setNodeBlackBall(nodeAddress: string) {
    await this.db.nodes.findOneAndUpdate({
      address: nodeAddress
    }, {
      blackBalled: true
    });
  }

  async setStatus(
    unresponsive: boolean,
    nodeAddress: string,
    syncStatus?: SyncRequestMessage
  ) {
    let modifier: OnlyFieldsOfType<Node> = {
      unresponsive: unresponsive
    };

    if (!unresponsive) {
      modifier = {
        unresponsive: unresponsive,
        lastSeen: new Date(),
        ...syncStatus
      };
    }

    await this.db.nodes.findOneAndUpdate({
      address: nodeAddress
    }, modifier);

    const nodes = await this.db.nodes.find({
      blackBalled: false,
      unresponsive: false
    });

    const winningPost = nodes.length / 2;
    let winner: NodeRecord;

    nodes.forEach(candidate => {
      const votes = nodes.filter(n => n.leaderAddress === candidate.leaderAddress).length;
      console.log(candidate.leaderAddress + ' ' + votes)
      if (votes > winningPost) {
        winner = candidate;
      }
    });

    if ( winner && !winner.isLeader ) {
      await this.db.nodes.updateMany({
        address: { $ne: winner.address }
      }, {
        isLeader: false
      })
      await this.db.nodes.upsertOne({
        address: winner.address
      }, {
        isLeader: true
      })
    }

    this.eventGateway.emitNodes(await this.getNodeDtos());
  }

  async getLeaderNode(): Promise<{
    leaderNode: NodeRecord,
    blockHash: string
  }> {
    const nodes = await this.db.nodes.find({
      unresponsive: false,
      blackBalled: false
    }, {
      sort: {
        address: 1
      }
    });
    this.logger.debug('Available nodes:', { nodes: nodes.length });

    // Note that mainnet is hardcoded.  It's just about selecting a random node
    // Hence, it does not matter if we use it for a testnet submission
    const blockHash = await this.bitcoinServiceFactory.getService(Network.mainnet).getLatestBlock();
    let leader: NodeRecord;

    if (nodes.length > 1) {
      this.logger.debug('Is connected');
      const nodeNumber = getCurrentNodeForHash(blockHash, nodes.length);
      this.logger.debug('Current node number:' + nodeNumber + ' of ' + nodes.length);
      leader = nodes[nodeNumber];
      this.logger.debug('Selected Node', leader.address);
    } else {
      // Select this node
      this.logger.debug('Self selected' + nodes[0]?.address);
      leader = nodes[0];
    }

    return { leaderNode: leader, blockHash };
  }

  async onModuleInit() {
    this.logger.log('Message Sender Service - On Module Init');
    const nodeCount = await this.db.nodes.count({
      address: this.apiConfigService.nodeAddress
    });
    if (nodeCount === 0) {
      this.logger.log('Insert local node');
      const leader = await this.getLeaderNode();
      await this.db.nodes.insert({
        address: this.apiConfigService.nodeAddress,
        nodeName: this.apiConfigService.nodeName,
        unresponsive: false,
        blackBalled: false,
        publicKey: this.messageAuthService.publicKey,
        ownerEmail: this.apiConfigService.ownerEmail,
        lastSeen: new Date(),
        latestSubmissionHash: '',
        latestVerificationIndex: 0,
        latestSubmissionIndex: 0,
        latestVerificationHash: '',
        isLeader: false,
        leaderAddress: leader.leaderNode.address
      });
    } else {
      await this.db.nodes.upsertOne({
        address: this.apiConfigService.nodeAddress
      }, {
        nodeName: this.apiConfigService.nodeName,
        unresponsive: false,
        lastSeen: new Date(),
        publicKey: this.messageAuthService.publicKey,
        ownerEmail: this.apiConfigService.ownerEmail
      });
    }

    this.eventGateway.emitNodes(await this.getNodeDtos());
  }

  public async processNodeList(nodeList: NodeDto[]) {
    for (const node of nodeList) {
      await this.addNode(node);
    }
  }

}
