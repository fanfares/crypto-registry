import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Node, NodeDto, NodeRecord } from '@bcr/types';
import { EventGateway } from './event.gateway';

@Injectable()
export class NodeService {

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private eventGateway: EventGateway
  ) {
  }

  async getNodeDtos(): Promise<NodeDto[]> {
    return (await this.dbService.nodes.find({})).map(node => ({
      ...node,
      isLocal: node.address === this.apiConfigService.nodeAddress
    }));
  }

  async getLocalNode(): Promise<NodeDto> {
    const node = await this.dbService.nodes.findOne({
      address: this.apiConfigService.nodeAddress
    });
    return { ...node, isLocal: true };
  }

  public async addNode(node: Node): Promise<NodeRecord> {
    let nodeRecord = await this.dbService.nodes.findOne({ address: node.address });
    if (!nodeRecord) {
      const id = await this.dbService.nodes.insert(node);
      nodeRecord = await this.dbService.nodes.get(id);
    }
    this.eventGateway.emitNodes(await this.getNodeDtos());
    return nodeRecord;
  }

  async removeNode(nodeToRemoveAddress: string) {
    if (this.apiConfigService.nodeAddress === nodeToRemoveAddress) {
      throw new BadRequestException('Cannot remove local node');
    } else {
      await this.dbService.nodes.deleteMany({
        address: nodeToRemoveAddress
      });
    }
    this.eventGateway.emitNodes(await this.getNodeDtos());
  }

  async getNodeByAddress(address: string): Promise<NodeRecord> {
    return await this.dbService.nodes.findOne( { address })
  }

  async setNodeBlackBall(nodeAddress: string) {
    await this.dbService.nodes.findOneAndUpdate({
      address: nodeAddress
    }, {
      blackBalled: true
    })
  }
}
