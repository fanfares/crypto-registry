import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Network, NodeBase, NodeDto, NodeRecord, SyncRequestMessage } from '@bcr/types';
import { getCurrentNodeForHash } from './get-current-node-for-hash';
import { SignatureService } from '../authentication/signature.service';
import { OnlyFieldsOfType } from 'mongodb';
import { getLatestVerification } from '../verification/get-latest-verification';
import { WalletService } from '../crypto/wallet.service';
import { getWinningPost } from './get-winning-post';
import { EventGateway } from '../event-gateway';
import { BitcoinCoreService } from '../bitcoin-core-api/bitcoin-core-service';

@Injectable()
export class NodeService {

  thisNodeId: string;

  constructor(
    private db: DbService,
    private apiConfigService: ApiConfigService,
    private eventGateway: EventGateway,
    private logger: Logger,
    private messageAuthService: SignatureService,
    private walletService: WalletService,
    private bitcoinCoreService: BitcoinCoreService
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

  async addNode(node: NodeBase): Promise<NodeRecord> {
    let nodeRecord = await this.db.nodes.findOne({address: node.address});
    if (!nodeRecord) {
      const id = await this.db.nodes.insert(node);
      nodeRecord = await this.db.nodes.get(id);
    }
    await this.emitNodes();
    return nodeRecord;
  }

  async getCurrentNodeCount() {
    return await this.db.nodes.count({
      unresponsive: false,
      blackBalled: false
    });
  }

  async emitNodes() {
    this.eventGateway.emitNodes(await this.getNodeDtos());
  }

  async removeNode(nodeToRemoveAddress: string) {
    if (this.apiConfigService.nodeAddress === nodeToRemoveAddress) {
      throw new BadRequestException('Cannot remove local node');
    } else {
      await this.db.nodes.deleteMany({
        address: nodeToRemoveAddress
      });
    }
    await this.emitNodes();
  }

  async getNodeByAddress(address: string): Promise<NodeRecord> {
    return await this.db.nodes.findOne({address});
  }

  async getThisNode(): Promise<NodeRecord> {
    return await this.db.nodes.get(this.thisNodeId);
  }

  getThisNodeAddress(): string {
    return this.apiConfigService.nodeAddress;
  }

  async getThisNodeIsLeader(): Promise<boolean> {
    return (await this.db.nodes.get(this.thisNodeId)).isLeader;
  }

  async setNodeBlackBall(nodeAddress: string) {
    await this.db.nodes.findOneAndUpdate({
      address: nodeAddress
    }, {
      blackBalled: true
    });
    await this.emitNodes();
  }

  async updateLeader(): Promise<void> {
    try {
      this.logger.debug('update leader');
      await this.updateLeaderVote();
      await this.updateCurrentLeader();
      await this.emitNodes();
    } catch (err) {
      this.logger.error('update leader failed', {err});
      this.logger.error(err);
    }
  }

  private async updateCurrentLeader(): Promise<void> {

    const candidates = await this.getEligibleNodes();
    const winningPost = getWinningPost(candidates.length);
    let leader: NodeRecord;
    candidates.forEach(candidate => {
      const votes = candidates.filter(n => n.leaderVote && candidate.leaderVote && n.leaderVote === candidate.address).length;
      if (votes >= winningPost) {
        leader = candidate;
      }
    });

    this.logger.debug('leader is:' + leader?.address || 'no leader');

    if (leader && !leader.isLeader) {
      this.logger.log('leader has changed to ' + leader.address);
      await this.db.nodes.updateMany({
        address: {$ne: leader.address}
      }, {
        isLeader: false
      });

      const newLeader = await this.db.nodes.findOne({address: leader.address});

      await this.db.nodes.update(newLeader._id, {
        isLeader: true
      });
    }
  }

  async updateStatus(
    unresponsive: boolean,
    nodeAddress: string,
    syncStatus?: SyncRequestMessage
  ) {
    this.logger.debug('update status:', {syncStatus});
    let modifier: OnlyFieldsOfType<NodeBase> = {
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
  }

  public async getEligibleNodes(): Promise<NodeRecord[]> {

    const nodes = await this.db.nodes.find({
      unresponsive: false,
      blackBalled: false
    }, {
      sort: {
        address: 1
      }
    });

    this.logger.debug('responsive nodes:' + nodes.length);
    return nodes;
  }

  private async updateLeaderVote() {
    if (this.apiConfigService.forcedLeader) {
      await this.db.nodes.updateMany({}, {
        leaderVote: this.apiConfigService.forcedLeader
      });
      return;
    }

    const nodes = await this.getEligibleNodes();

    // Note that mainnet is hardcoded.  It's just about selecting a random node
    // Hence, it does not matter if we use it for a testnet submission
    let blockHash: string;

    try {
      blockHash = await this.bitcoinCoreService.getBestBlockHash(Network.testnet);
    } catch (err) {
      this.logger.error('failed to get latest block', {err});
      // todo - remove your vote?
      return;
    }

    let leader: NodeRecord;
    if (nodes.length > 1) {
      const nodeNumber = getCurrentNodeForHash(blockHash, nodes.length);
      this.logger.debug('leader number:' + nodeNumber + ' of ' + nodes.length);
      leader = nodes[nodeNumber];
    } else {
      leader = null;
    }

    const thisNode = await this.getThisNode();
    if (leader?.address !== thisNode.leaderVote) {
      this.logger.log('updating leader vote to: ' + leader?.address ?? 'null');
      await this.db.nodes.update(this.thisNodeId, {
        leaderVote: leader?.address ?? null
      });
    }
  }

  async isThisNodeLeader() {
    return (await this.getThisNode()).isLeader;
  }

  async getLeaderAddress(): Promise<string | null> {
    const leader = await this.db.nodes.findOne({isLeader: true});
    return leader?.address ?? null;
  }

  async startUp() {
    this.logger.log('node service - module init');
    const thisNode = await this.getNodeByAddress(this.apiConfigService.nodeAddress);
    const isSingleNodeService = this.apiConfigService.isSingleNodeService;
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
        latestVerificationId: null,
        latestSubmissionId: null,
        isLeader: isSingleNodeService,
        leaderVote: isSingleNodeService ? this.apiConfigService.nodeAddress : '',
      });
    } else {
      this.logger.log('refresh local node data');
      this.thisNodeId = thisNode._id;
      await this.db.nodes.update(thisNode._id, {
        nodeName: this.apiConfigService.nodeName,
        unresponsive: false,
        lastSeen: new Date(),
        publicKey: this.messageAuthService.publicKey,
        ownerEmail: this.apiConfigService.ownerEmail,
        isLeader: isSingleNodeService,
        leaderVote: isSingleNodeService ? this.apiConfigService.nodeAddress : '',
      });

      if (!isSingleNodeService) {
        await this.db.nodes.updateMany({
          nodeName: {$ne: this.apiConfigService.nodeName}
        }, {
          unresponsive: true,
          leaderVote: '',
          isLeader: false,
        });
      } else {
        await this.db.nodes.deleteMany({
          nodeName: {$ne: this.apiConfigService.nodeName}
        });
      }
    }

    await this.emitNodes();
    this.logger.log('node-service initialised');
  }

  public async processNodeList(nodeList: NodeDto[]) {
    for (const node of nodeList) {
      await this.addNode(node);
    }
  }

  async checkThisNodeRecordInSync(syncRequest: SyncRequestMessage) {
    const thisNode = await this.getThisNode();
    if (thisNode.latestSubmissionId !== syncRequest.latestSubmissionId
      || thisNode.latestVerificationId !== syncRequest.latestVerificationId
    ) {
      await this.db.nodes.update(thisNode._id, {
        latestVerificationId: syncRequest.latestVerificationId,
        latestSubmissionId: syncRequest.latestSubmissionId,
      });
      await this.emitNodes();
    }
  }

  public async getSyncRequest(): Promise<SyncRequestMessage> {
    const latestSubmission = await this.db.fundingSubmissions.findOne({
    }, {
      sort: {
        updatedDate: -1
      }
    });
    const latestVerification = await getLatestVerification(this.db);
    const thisNode = await this.getThisNode();

    return {
      address: this.apiConfigService.nodeAddress,
      latestSubmissionId: latestSubmission?._id || null,
      latestVerificationId: latestVerification?._id || null,
      leaderVote: thisNode.leaderVote,
    };
  }
}
