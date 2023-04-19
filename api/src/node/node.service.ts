import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Network, NodeBase, NodeDto, NodeRecord, SyncRequestMessage } from '@bcr/types';
import { EventGateway } from '../network/event.gateway';
import { getCurrentNodeForHash } from './get-current-node-for-hash';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { SignatureService } from '../authentication/signature.service';
import { OnlyFieldsOfType } from 'mongodb';
import {isMissingData} from "../syncronisation/is-missing-data";

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

  public async addNode(node: NodeBase): Promise<NodeRecord> {
    let nodeRecord = await this.db.nodes.findOne({address: node.address});
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
    return await this.db.nodes.findOne({address});
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
    try {
      this.logger.log('update leader');
      await this.updateLeaderVote();
      const leader = this.updateCurrentLeader();
      this.eventGateway.emitNodes(await this.getNodeDtos());
      return leader;
    } catch (err) {
      this.logger.error('Failed to update leader', {err});
      await this.db.nodes.update(this.thisNodeId, {});
    }
  }

  private async updateCurrentLeader(): Promise<NodeRecord | null> {

    const candidates = await this.getEligibleNodes()
    const winningPost = candidates.length / 2;
    let leader: NodeRecord;

    candidates.forEach(candidate => {
      const votes = candidates.filter(n => n.leaderVote && candidate.leaderVote && n.leaderVote === candidate.address).length;
      this.logger.log('votes for ' + candidate.address + ' = ' + votes);
      if (votes > winningPost) {
        leader = candidate;
      }
    });

    this.logger.log('leader is:' + leader?.address || 'no leader');

    if (leader && !leader.isLeader) {
      this.logger.log('leader has changed to ' + leader.address);
      await this.db.nodes.updateMany({
        address: {$ne: leader.address}
      }, {
        isLeader: false
      });
      await this.db.nodes.upsertOne({
        address: leader.address
      }, {
        isLeader: true
      });
    }

    return this.getLeader();
  }

  async updateStatus(
    unresponsive: boolean,
    nodeAddress: string,
    syncStatus?: SyncRequestMessage
  ) {
    this.logger.log('update status', {syncStatus});
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

    await this.updateLeader();
  }

  private async getEligibleNodes(): Promise<NodeRecord[]> {

    const nodes = await this.db.nodes.find({
      unresponsive: false,
      blackBalled: false
    }, {
      sort: {
        address: 1
      }
    });

    // Remove nodes that are behind this node
    const eligibleNodes: NodeRecord[] = []

    const thisNode = await this.getThisNode();
    for (const candidateNode of nodes) {
      if (candidateNode.address === thisNode.address || !isMissingData(candidateNode, thisNode)) {
        eligibleNodes.push(candidateNode)
      }
    }

    return eligibleNodes;
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
    const blockHash = await this.bitcoinServiceFactory.getService(Network.mainnet).getLatestBlock();

    let leader: NodeRecord;
    if (nodes.length > 1) {
      this.logger.log('multi-node mode: ', nodes.map(n => n.nodeName));
      const nodeNumber = getCurrentNodeForHash(blockHash, nodes.length);
      this.logger.log('leader number:' + nodeNumber + ' of ' + nodes.length);
      leader = nodes[nodeNumber];
    } else {
      leader = null;
    }

    const thisNode = await this.getThisNode()
    this.logger.log(thisNode.address + ' leader vote ' + leader?.address ?? 'null' + ' for ' + this.thisNodeId);
    await this.db.nodes.update(this.thisNodeId, {
      leaderVote: leader?.address ?? null
    });
  }

  async isThisNodeLeader() {
    return (await this.getThisNode()).isLeader;
  }

  async getLeader(): Promise<NodeRecord | null> {
    return await this.db.nodes.findOne({isLeader: true});
  }

  async getLeaderVote(): Promise<string | null> {
    return (await this.getThisNode()).leaderVote;
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
        testnetRegistryWalletAddressCount: 0,
        mainnetRegistryWalletAddressCount: 0,
        isLeader: false,
        leaderVote: ''
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
        isLeader: false,
        leaderVote: ''
      });
    }
  }

  public async processNodeList(nodeList: NodeDto[]) {
    for (const node of nodeList) {
      await this.addNode(node);
    }
  }

  async checkThisNodeRecordInSync(syncRequest: SyncRequestMessage) {
    const thisNode = await this.getThisNode();
    if (thisNode.latestSubmissionIndex !== syncRequest.latestSubmissionIndex
      || thisNode.latestSubmissionHash !== syncRequest.latestSubmissionHash
      || thisNode.latestVerificationIndex !== syncRequest.latestVerificationIndex
      || thisNode.latestVerificationHash !== syncRequest.latestSubmissionHash
      || thisNode.testnetRegistryWalletAddressCount !== syncRequest.testnetRegistryWalletAddressCount
      || thisNode.mainnetRegistryWalletAddressCount !== syncRequest.mainnetRegistryWalletAddressCount
    ) {
      await this.db.nodes.update(thisNode._id, {
        latestVerificationHash: syncRequest.latestVerificationHash,
        latestVerificationIndex: syncRequest.latestVerificationIndex,
        latestSubmissionHash: syncRequest.latestSubmissionHash,
        latestSubmissionIndex: syncRequest.latestSubmissionIndex,
        testnetRegistryWalletAddressCount: syncRequest.testnetRegistryWalletAddressCount,
        mainnetRegistryWalletAddressCount: syncRequest.mainnetRegistryWalletAddressCount
      });
      this.eventGateway.emitNodes(await this.getNodeDtos());
    }
  }
}
