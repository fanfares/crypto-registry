import { Network, ResetNodeOptions } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { NodeService } from '../node';
import { MockWalletService } from "../crypto/mock-wallet.service";

export const createTestData = async (
  dbService: DbService,
  apiConfigService: ApiConfigService,
  walletService: WalletService,
  nodeService: NodeService,
  options: ResetNodeOptions
): Promise<void> => {
  if (options.resetChains) {
    await dbService.customerHoldings.deleteMany({});
    await dbService.submissions.deleteMany({});
    await dbService.verifications.deleteMany({});
    await dbService.submissionConfirmations.deleteMany({});
  }

  if (options.resetAll) {
    await dbService.reset();
    await dbService.users.insert({
      email: apiConfigService.ownerEmail,
      isVerified: false
    });
    await nodeService.startUp();
  }

  if (options.autoStart) {
    await nodeService.setStartupComplete()
  }

  if (apiConfigService.forcedLeader) {
    const nodes = await dbService.nodes.find({})

    for (const node of nodes) {
      await dbService.nodes.update(node._id, {
        isLeader: apiConfigService.forcedLeader ? apiConfigService.forcedLeader === node.address : false,
        leaderVote: apiConfigService.forcedLeader ?? ''
      })
    }
  }

  if (options.resetMockWallet || options.resetAll) {
    await dbService.mockAddresses.deleteMany({})
    await dbService.mockTransactions.deleteMany({})
    await walletService.resetHistory(apiConfigService.getRegistryZpub(Network.testnet), false);
    await walletService.resetHistory(apiConfigService.getRegistryZpub(Network.mainnet), false);
  }

  if (options.resetWallet || options.resetAll) {
    await walletService.resetHistory(apiConfigService.getRegistryZpub(Network.testnet), false);
    await walletService.resetHistory(apiConfigService.getRegistryZpub(Network.mainnet), false);
  }

  if (walletService instanceof MockWalletService) {
    await walletService.reset()
  }
};
