import { TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { createTestModule } from '../testing/create-test-module';
import { VerificationResult } from '@bcr/types';
import { MailService } from '../mail-service';
import { createTestDataFromModule } from '../testing/create-test-data-from-module';
import { MockMailService } from '../mail-service/mock-mail-service';
import { TestIds } from '../testing/create-test-data';

describe('customer-controller', () => {
  let controller: CustomerController;
  let module: TestingModule;
  let ids: TestIds;

  beforeEach(async () => {
    module = await createTestModule();
    ids = await createTestDataFromModule(module, {
      createSubmission: true
    });
    controller = module.get<CustomerController>(CustomerController);
  });

  afterAll(async () => {
    await module.close();
  });

  it('verify valid holdings', async () => {
    const result = await controller.verifyHoldings({
      email: ids.customerEmail,
    });

    expect(result.verificationResult).toBe(VerificationResult.EMAIL_SENT);

    const mailService = module.get<MailService>(
      MailService,
    ) as any as MockMailService;
    expect(
      mailService.lastVerificationEmail.verifiedHoldings[0].exchangeName,
    ).toBe(ids.exchangeName);
    expect(
      mailService.lastVerificationEmail.verifiedHoldings[0]
        .customerHoldingAmount,
    ).toBe(1000);
    expect(mailService.lastVerificationEmail.toEmail).toBe(
      mailService.lastVerificationEmail.toEmail,
    );
  });
});
