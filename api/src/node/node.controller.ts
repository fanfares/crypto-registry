import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { NetworkStatusDto, NodeAddress } from "@bcr/types";
import { MessageSenderService } from "../network/message-sender.service";
import { NodeService } from "./node.service";
import { ApiConfigService } from "../api-config";

@ApiTags('node')
@Controller('node')
export class NodeController {

  constructor(
    private messageSenderService: MessageSenderService,
    private nodeService: NodeService,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Get()
  @ApiResponse({type: NetworkStatusDto})
  async getNetworkStatus(): Promise<NetworkStatusDto> {
    return {
      nodeName: this.apiConfigService.nodeName,
      address: this.apiConfigService.nodeAddress,
      nodes: await this.nodeService.getNodeDtos()
    };
  }


  @Post('remove-node')
  @ApiBody({type: NodeAddress})
  async removeNode(
    @Body() body: NodeAddress
  ) {
    await this.nodeService.removeNode(body.nodeAddress);
    await this.messageSenderService.broadcastRemoveNode(body.nodeAddress);
  }

}
