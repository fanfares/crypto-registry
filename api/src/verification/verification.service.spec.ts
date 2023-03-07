import { TestingModule } from '@nestjs/testing';
import { createTestDataFromModule, createTestModule, TestIds } from '../testing';
import { MockSendMailService } from '../mail-service';
import { DbService } from '../db/db.service';
import subDays from 'date-fns/subDays';
import { VerificationService } from './verification.service';
import { SendMailService } from '../mail-service/send-mail-service';
import { MockMessageTransportService } from '../network/mock-message-transport.service';

describe('verification-service', () => {
  let service: VerificationService;
  let db: DbService;
  let module: TestingModule;
  let ids: TestIds;
  let sendMailService: MockSendMailService;

  beforeEach(async () => {
    module = await createTestModule(new MockMessageTransportService());
    ids = await createTestDataFromModule(module, {
      createSubmission: true,
      completeSubmission: true
    });
    service = module.get<VerificationService>(VerificationService);
    db = module.get<DbService>(DbService);
    sendMailService = module.get<SendMailService>(SendMailService) as MockSendMailService;
  });

  afterEach(async () => {
    await module.close();
  });

  it('verify valid holdings', async () => {
    await service.verify({ email: ids.customerEmail }, true);
    expect(sendMailService.getVal('verifiedHoldings')[0].exchangeName).toBe(ids.exchangeName);
    expect(sendMailService.getVal('verifiedHoldings')[0].customerHoldingAmount).toBe(0.1);
    expect(sendMailService.getVal('toEmail')).toBe(sendMailService.getLastToEmail());
  });

  it('should throw exception if email is not submitted', async () => {
    await expect(service.verify({ email: 'not-submitted@mail.com' }, true)).rejects.toThrow();
    expect(sendMailService.noEmailSent).toBe(true);
  });

  it('should not verify if submission is too old', async () => {
    const oldDate = subDays(Date.now(), 8);
    await db.submissions.updateMany({
      paymentAddress: ids.submissionAddress
    }, {
      createdDate: oldDate
    });

    await expect(service.verify({ email: 'not-submitted@mail.com' }, true)).rejects.toThrow();
    expect(sendMailService.noEmailSent).toBe(true);
  });
});
