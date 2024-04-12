import { Logger } from '@nestjs/common';
import { ServiceTestRequestDto, ServiceTestResultDto, ServiceType } from '@bcr/types';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';

export async function executeServiceTests(
  bitcoinServiceFactory: BitcoinServiceFactory,
  bitcoinCoreApiFactory: BitcoinCoreApiFactory,
  logger: Logger,
  request: ServiceTestRequestDto
): Promise<ServiceTestResultDto> {
  const result: ServiceTestResultDto = {
    passed: false
  };

  try {
    if (request.serviceType === ServiceType.BITCOIN_CORE) {
      result.passed = !!await bitcoinCoreApiFactory.getApi(request.network).getBestBlockHash();
    } else if (request.serviceType === ServiceType.ELECTRUM_X) {
      result.passed = await bitcoinServiceFactory.getService(request.network).testService() > 0;
    }
  } catch (err) {
    result.errorMessage = err.message;
    logger.error('ElectrumX Mainnet Down', {
      err: err.message,
      stack: err.stack
    });
  }

  return result;
}
