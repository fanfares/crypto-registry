import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Network, Node, NodeDto, NodeRecord, SyncRequestMessage } from '@bcr/types';
import { EventGateway } from '../network/event.gateway';
import { getCurrentNodeForHash } from './get-current-node-for-hash';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { SignatureService } from '../authentication/signature.service';
import { OnlyFieldsOfType } from 'mongodb';

@Injectable()
export class NodeService implements OnModuleInit {

  thisNodeId: string;

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
    return (await this.db.nodes.find({}, {
      sort: {
        address: 1
      }
    })).map(node => ({
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
    return await this.db.nodes.get(this.thisNodeId);
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

  async updateLeader(): Promise<NodeRecord | null> {
    this.logger.log('update leader')
    await this.updateLeaderVote();
    const leader = this.updateCurrentLeader()
    this.eventGateway.emitNodes(await this.getNodeDtos());
    return leader;
  }

  private async updateCurrentLeader(): Promise<NodeRecord | null> {

    const candidates = await this.db.nodes.find({
      blackBalled: false,
      unresponsive: false
    }, {
      sort: {
        address: 1
      }
    });
    this.logger.debug('update current leader', { candidates })

    const winningPost = candidates.length / 2;
    let winner: NodeRecord;

    candidates.forEach(candidate => {
      const votes = candidates.filter(n => n.leaderVote && candidate.leaderVote && n.leaderVote === candidate.address).length;
      this.logger.log('votes for ' + candidate.address + ' = ' + votes)
      if (votes > winningPost) {
        winner = candidate;
      }
    });

    this.logger.log('leader is ' + winner?.address || 'no leader', { winner })

    if ( winner && !winner.isLeader ) {
      this.logger.log('leader has changed to ' + winner.address)
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
    } else {
      this.logger.log('leader has not changed from:' + winner?.address || 'no leader')
    }


    return this.getLeader()
  }

  async updateStatus(
    unresponsive: boolean,
    nodeAddress: string,
    syncStatus?: SyncRequestMessage
  ) {
    this.logger.log('update status', { syncStatus })
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

    await this.updateLeader();
  }

  private async updateLeaderVote() {
    const nodes = await this.db.nodes.find({
      unresponsive: false,
      blackBalled: false
    }, {
      sort: {
        address: 1
      }
    });
    this.logger.debug('nodes available for leadership:', { nodes });

    // Note that mainnet is hardcoded.  It's just about selecting a random node
    // Hence, it does not matter if we use it for a testnet submission
    const blockHash = await this.bitcoinServiceFactory.getService(Network.mainnet).getLatestBlock();
    let leader: NodeRecord;

    if (nodes.length > 1) {
      this.logger.debug('multi-node mode');
      const nodeNumber = getCurrentNodeForHash(blockHash, nodes.length);
      this.logger.debug('leader number:' + nodeNumber + ' of ' + nodes.length);
      leader = nodes[nodeNumber];
    } else {
      // Select this node
      this.logger.debug('single node mode');
      leader = nodes[0];
    }

    this.logger.log('update leader vote to ' + leader.address + ' for ' + this.thisNodeId);
    await this.db.nodes.update(this.thisNodeId, {
      leaderVote: leader.address
    })
  }

  async getLeader(): Promise<NodeRecord | null> {
    return await this.db.nodes.findOne({ isLeader: true})
  }

  async onModuleInit() {
    this.logger.log('node service - module init');
    const thisNode = await this.getNodeByAddress(this.apiConfigService.nodeAddress);
    if (!thisNode) {
      this.logger.log('create local node record');
      this.thisNodeId = await this.db.nodes.insert({
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
        leaderVote: ''
      });
    } else {
      this.logger.log('refresh local node data: ');
      this.thisNodeId = thisNode._id;
      await this.db.nodes.update(thisNode._id, {
        nodeName: this.apiConfigService.nodeName,
        unresponsive: false,
        lastSeen: new Date(),
        publicKey: this.messageAuthService.publicKey,
        ownerEmail: this.apiConfigService.ownerEmail
      });
    }

    await this.updateLeader()
  }

  public async processNodeList(nodeList: NodeDto[]) {
    for (const node of nodeList) {
      await this.addNode(node);
    }
  }

}
