import { TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { createTestModule, createTestDataFromModule, TestIds } from '../testing';
import { VerificationResult } from '@bcr/types';
import { MailService } from '../mail-service';
import { MockMailService } from '../mail-service/mock-mail-service';

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

  afterEach(async () => {
    await module.close();
  });

  it('verify valid holdings', async () => {
    const result = await controller.verifyHoldings({
      email: ids.customerEmail
    });

    expect(result.verificationResult).toBe(VerificationResult.EMAIL_SENT);

    const mailService = module.get<MailService>(MailService) as any as MockMailService;
    expect(mailService.lastVerificationEmail.verifiedHoldings[0].exchangeName).toBe(ids.exchangeName);
    expect(mailService.lastVerificationEmail.verifiedHoldings[0].customerHoldingAmount).toBe(1000);
    expect(mailService.lastVerificationEmail.toEmail).toBe(mailService.lastVerificationEmail.toEmail);
  });
});
