import { ResetNodeOptions } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { NodeService } from '../node';

export const createTestData = async (
  dbService: DbService,
  apiConfigService: ApiConfigService,
  nodeService: NodeService,
  options: ResetNodeOptions
): Promise<void> => {
  if (options.resetChains) {
    await dbService.holdings.deleteMany({});
    await dbService.fundingSubmissions.deleteMany({});
    await dbService.verifications.deleteMany({});
    await dbService.submissionConfirmations.deleteMany({});
  }

  if (options.resetAll) {
    await dbService.reset();
    await dbService.users.insert({
      email: apiConfigService.ownerEmail,
      isVerified: false,
      isSystemAdmin: false
    });
  }

  await nodeService.startUp();

  if (apiConfigService.forcedLeader) {
    const nodes = await dbService.nodes.find({});

    for (const node of nodes) {
      await dbService.nodes.update(node._id, {
        isLeader: apiConfigService.forcedLeader ? apiConfigService.forcedLeader === node.address : false,
        leaderVote: apiConfigService.forcedLeader ?? ''
      });
    }
  }
};
