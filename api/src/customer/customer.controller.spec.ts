import { TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { createTestModule, createTestDataFromModule, TestIds } from '../testing';
import { MailService } from '../mail-service';
import { MockMailService } from '../mail-service/mock-mail-service';

describe('customer-controller', () => {
  let controller: CustomerController;
  let module: TestingModule;
  let ids: TestIds;

  beforeEach(async () => {
    module = await createTestModule();
    ids = await createTestDataFromModule(module, {
      createSubmission: true,
      completeSubmission: true
    });
    controller = module.get<CustomerController>(CustomerController);
  });

  afterEach(async () => {
    await module.close();
  });

  it('verify valid holdings', async () => {
    await controller.verifyHoldings({ email: ids.customerEmail });
    const mailService = module.get<MailService>(MailService) as any as MockMailService;
    expect(mailService.lastVerificationEmail.verifiedHoldings[0].exchangeName).toBe(ids.exchangeName);
    expect(mailService.lastVerificationEmail.verifiedHoldings[0].customerHoldingAmount).toBe(10000000);
    expect(mailService.lastVerificationEmail.toEmail).toBe(mailService.lastVerificationEmail.toEmail);
  });

  it('should throw exception if email is not submitted', async () => {
    await expect(controller.verifyHoldings({ email: 'not-submitted@mail.com' })).rejects.toThrow()
    const mailService = module.get<MailService>(MailService) as any as MockMailService;
    expect(mailService.lastVerificationEmail).toBeUndefined();
  });
});
