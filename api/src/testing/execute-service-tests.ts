import { Logger } from '@nestjs/common'
import { Network, ServiceTestResultDto } from '@bcr/types';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';

export async function executeServiceTests(
  bitcoinServiceFactory: BitcoinServiceFactory,
  bitcoinCoreApiFactory: BitcoinCoreApiFactory,
  logger: Logger
) {
  const electrumxMainnet: ServiceTestResultDto = {
    passed: false
  };
  const electrumxTestnet: ServiceTestResultDto = {
    passed: false
  };
  const bitcoinCoreMainnet: ServiceTestResultDto = {
    passed: false
  };
  const bitcoinCoreTestnet: ServiceTestResultDto = {
    passed: false
  };

  try {
    electrumxMainnet.passed = await bitcoinServiceFactory.getService(Network.mainnet).testService() > 0;
  } catch (err) {
    electrumxMainnet.errorMessage = err.message;
    logger.error('ElectrumX Mainnet Down', {
      err: err.message,
      stack: err.stack
    });
  }

  try {
    electrumxTestnet.passed = await bitcoinServiceFactory.getService(Network.testnet).testService() > 0;
  } catch (err) {
    electrumxTestnet.errorMessage = err.message;
    logger.error('ElectrumX Testnet Down', {
      err: err.message,
      stack: err.stack
    });
  }

  try {
    bitcoinCoreMainnet.passed = !!await bitcoinCoreApiFactory.getApi(Network.mainnet).getBestBlockHash();
  } catch (err) {
    bitcoinCoreMainnet.errorMessage = err.message;
    logger.error('Bitcoin Core Mainnet Down', {
      err: err.message,
      stack: err.stack
    });
  }

  try {
    bitcoinCoreTestnet.passed = !!await bitcoinCoreApiFactory.getApi(Network.testnet).getBestBlockHash();
  } catch (err) {
    bitcoinCoreTestnet.errorMessage = err.message;
    logger.error('Bitcoin Core Testnet Down', {
      err: err.message,
      stack: err.stack
    });
  }

  return {
    electrumxTestnet, electrumxMainnet, bitcoinCoreMainnet, bitcoinCoreTestnet
  };
}
