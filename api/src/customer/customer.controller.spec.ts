import { TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { createTestDataFromModule, createTestModule, TestIds } from '../testing';
import { MailService } from '../mail-service';
import { MockMailService } from '../mail-service/mock-mail-service';
import { DbService } from '../db/db.service';
import subDays from 'date-fns/subDays';
import { Network } from '@bcr/types';

describe('customer-controller', () => {
  let controller: CustomerController;
  let db: DbService;
  let module: TestingModule;
  let ids: TestIds;

  beforeEach(async () => {
    module = await createTestModule();
    ids = await createTestDataFromModule(module, {
      createSubmission: true,
      completeSubmission: true
    });
    controller = module.get<CustomerController>(CustomerController);
    db = module.get<DbService>(DbService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('verify valid holdings', async () => {
    await controller.verifyHoldings({ email: ids.customerEmail, network: Network.testnet });
    const mailService = module.get<MailService>(MailService) as any as MockMailService;
    expect(mailService.lastVerificationEmail.verifiedHoldings[0].exchangeName).toBe(ids.exchangeName);
    expect(mailService.lastVerificationEmail.verifiedHoldings[0].customerHoldingAmount).toBe(10000000);
    expect(mailService.lastVerificationEmail.toEmail).toBe(mailService.lastVerificationEmail.toEmail);
  });

  it('should throw exception if email is not submitted', async () => {
    await expect(controller.verifyHoldings({ email: 'not-submitted@mail.com', network: Network.testnet })).rejects.toThrow();
    const mailService = module.get<MailService>(MailService) as any as MockMailService;
    expect(mailService.lastVerificationEmail).toBeUndefined();
  });

  it('should not verify if submission is too old', async () => {
    const oldDate = subDays(Date.now(), 8);
    await db.submissions.updateMany({
      paymentAddress: ids.submissionAddress
    }, {
      createdDate: oldDate
    });

    await expect(controller.verifyHoldings({ email: 'not-submitted@mail.com', network: Network.testnet })).rejects.toThrow();
    const mailService = module.get<MailService>(MailService) as any as MockMailService;
    expect(mailService.lastVerificationEmail).toBeUndefined();
  });
});
