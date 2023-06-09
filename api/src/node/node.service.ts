import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Network, NodeBase, NodeDto, NodeRecord, SyncRequestMessage } from '@bcr/types';
import { EventGateway } from '../network/event.gateway';
import { getCurrentNodeForHash } from './get-current-node-for-hash';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { SignatureService } from '../authentication/signature.service';
import { OnlyFieldsOfType } from 'mongodb';
import { getLatestSubmissionBlock } from "../submission/get-latest-submission-block";
import { getLatestVerificationBlock } from "../verification/get-latest-verification-block";
import { WalletService } from "../crypto/wallet.service";
import { candidateIsMissingData } from "../syncronisation/candidate-is-missing-data";
import { getWinningPost } from "./get-winning-post";

@Injectable()
export class NodeService implements OnModuleInit {

  thisNodeId: string;

  constructor(
    private db: DbService,
    private apiConfigService: ApiConfigService,
    private eventGateway: EventGateway,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private logger: Logger,
    private messageAuthService: SignatureService,
    private walletService: WalletService
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
    })
  }

  async emitNodes() {
    this.eventGateway.emitNodes(await this.getNodeDtos())
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

  async setStartupComplete() {
    await this.db.nodes.update(this.thisNodeId, {isStarting: false})
    await this.emitNodes()
  }

  async setNodeBlackBall(nodeAddress: string) {
    await this.db.nodes.findOneAndUpdate({
      address: nodeAddress
    }, {
      blackBalled: true
    });
    await this.emitNodes()
  }

  async updateLeader(): Promise<void> {
    try {
      this.logger.log('Update Leader');
      await this.updateLeaderVote();
      await this.updateCurrentLeader();
      await this.emitNodes();
    } catch (err) {
      this.logger.error('Failed to update leader', {err});
      await this.db.nodes.update(this.thisNodeId, {
        isLeader: false,
        leaderVote: ''
      });
    }
  }

  private async updateCurrentLeader(): Promise<void> {

    const candidates = await this.getEligibleNodes()
    const winningPost = getWinningPost(candidates.length);
    let leader: NodeRecord;
    candidates.forEach(candidate => {
      const votes = candidates.filter(n => n.leaderVote && candidate.leaderVote && n.leaderVote === candidate.address).length;
      this.logger.log('Votes for ' + candidate.address + ' = ' + votes);
      if (votes >= winningPost) {
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
  }

  async updateStatus(
    unresponsive: boolean,
    nodeAddress: string,
    syncStatus?: SyncRequestMessage
  ) {
    this.logger.log('update status', {syncStatus});
    let modifier: OnlyFieldsOfType<NodeBase> = {
      unresponsive: unresponsive,
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

  public async getEligibleNodes(): Promise<NodeRecord[]> {

    const nodes = await this.db.nodes.find({
      unresponsive: false,
      blackBalled: false
    }, {
      sort: {
        address: 1
      }
    });

    this.logger.debug('Responsive Nodes', {nodes})

    // Remove nodes that are behind this node
    let eligibleNodes: NodeRecord[] = []

    const thisNode = await this.getThisNode();

    let isThisNodeEligible = false;
    nodes.filter(node => node.nodeName !== thisNode.nodeName)
      .forEach(node => {
        const isThisNodeBehindCandidate = candidateIsMissingData(node, thisNode)
        if (isThisNodeBehindCandidate) {
          isThisNodeEligible = true;
        }
      })
    this.logger.debug('This node', {thisNode, isThisNodeEligible})
    if (!isThisNodeEligible) {
      eligibleNodes.push(thisNode)
    }

    for (const candidateNode of nodes) {
      const isCandidateIsMissingData = candidateIsMissingData(thisNode, candidateNode)
      this.logger.log(`${candidateNode.nodeName} is missing data relative to this node: ${isCandidateIsMissingData}`)

      if (candidateNode.address !== thisNode.address && !isCandidateIsMissingData) {
        eligibleNodes.push(candidateNode)
      }
    }

    eligibleNodes = eligibleNodes.sort((a, b) => a.address < b.address ? 1 : -1)
    this.logger.debug('Sorted eligible leader nodes', {nodes: eligibleNodes.map(n => n.address)})
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
    const blockHash = await this.bitcoinServiceFactory.getService(Network.testnet).getLatestBlock();

    let leader: NodeRecord;
    if (nodes.length > 1) {
      this.logger.log('Multi-node mode: ', nodes.map(n => n.nodeName));
      const nodeNumber = getCurrentNodeForHash(blockHash, nodes.length);
      this.logger.log('leader number:' + nodeNumber + ' of ' + nodes.length);
      leader = nodes[nodeNumber];
    } else {
      leader = null;
    }

    this.logger.log('Leader vote ' + leader?.address ?? 'null' + ' for ' + this.thisNodeId);
    await this.db.nodes.update(this.thisNodeId, {
      leaderVote: leader?.address ?? null
    });
  }

  async isThisNodeLeader() {
    return (await this.getThisNode()).isLeader;
  }

  async isThisNodeStarting() {
    return (await this.getThisNode()).isStarting;
  }

  async getLeaderAddress(): Promise<string | null> {
    const leader = await this.db.nodes.findOne({isLeader: true})
    return leader?.address ?? null;
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
        leaderVote: '',
        isStarting: true
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
        leaderVote: '',
        isStarting: true
      });

      await this.db.nodes.updateMany({
        _id: {$ne: this.thisNodeId}
      }, {
        unresponsive: true,
        leaderVote: '',
        isLeader: false
      })
    }

    await this.emitNodes()
    this.logger.log('node-service initialised')
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
      await this.emitNodes();
    }
  }

  public async getSyncRequest(): Promise<SyncRequestMessage> {
    const latestSubmissionBlock = await getLatestSubmissionBlock(this.db);
    const latestVerificationBlock = await getLatestVerificationBlock(this.db);
    // todo - how to disallow mainnet requests.
    const mainnetRegistryWalletAddressCount = 0 // await this.walletService.getAddressCount(this.apiConfigService.getRegistryZpub(Network.mainnet));
    const testnetRegistryWalletAddressCount = await this.walletService.getAddressCount(this.apiConfigService.getRegistryZpub(Network.testnet));
    const thisNode = await this.getThisNode();

    return {
      latestSubmissionHash: latestSubmissionBlock?.hash || null,
      latestSubmissionIndex: latestSubmissionBlock?.index || 0,
      latestVerificationHash: latestVerificationBlock?.hash || null,
      latestVerificationIndex: latestVerificationBlock?.index || 0,
      leaderVote: thisNode.leaderVote,
      mainnetRegistryWalletAddressCount,
      testnetRegistryWalletAddressCount,
      isStarting: thisNode.isStarting
    };
  }
}
