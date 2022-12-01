import { TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { createTestModule } from '../testing/create-test-module';
import { TestData } from '../testing/create-test-data';
import { VerificationResult } from '@bcr/types';
import { MockMailService } from '../mail/mock-mail-service';
import { MailService } from '../mail/mail.service';
import { createTestDataFromModule } from '../testing/create-test-data-from-module';

describe('CustomerHoldingController', () => {
  let controller: CustomerController;
  let module: TestingModule;
  let testData: TestData;

  beforeEach(async () => {
    module = await createTestModule();
    testData = await createTestDataFromModule(module);
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

    const mailService: MockMailService = module.get<MailService>(
      MailService,
    ) as any;
    expect(mailService.lastEmail.custodianName).toBe(testData.exchangeName);
  });
});
