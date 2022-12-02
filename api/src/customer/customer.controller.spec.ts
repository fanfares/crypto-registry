import { TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { createTestModule } from '../testing/create-test-module';
import { TestData } from '../testing/create-test-data';
import { VerificationResult } from '@bcr/types';
import { MailService } from '../mail-service';
import { createTestDataFromModule } from '../testing/create-test-data-from-module';
import { MockMailService } from '../mail-service/mock-mail-service';

describe('customer-controller', () => {
  let controller: CustomerController;
  let module: TestingModule;
  let testData: TestData;

  beforeEach(async () => {
    module = await createTestModule();
    testData = await createTestDataFromModule(module, {
      createHoldings: true,
    });
    controller = module.get<CustomerController>(CustomerController);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', async () => {
    const result = await controller.verifyHoldings({
      email: testData.customerEmail,
    });

    expect(result.verificationResult).toBe(VerificationResult.EMAIL_SENT);

    const mailService = module.get<MailService>(
      MailService,
    ) as any as MockMailService;
    expect(
      mailService.lastVerificationEmail.verifiedHoldings[0].exchangeName,
    ).toBe(testData.exchangeName);
    expect(
      mailService.lastVerificationEmail.verifiedHoldings[0]
        .customerHoldingAmount,
    ).toBe(1000);
    expect(mailService.lastVerificationEmail.toEmail).toBe(
      mailService.lastVerificationEmail.toEmail,
    );
  });
});
