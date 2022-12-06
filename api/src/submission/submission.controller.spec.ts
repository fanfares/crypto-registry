import { SubmissionController } from './submission.controller';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { SubmissionStatus, SubmissionStatusDto } from '@bcr/types';
import { createTestModule, createTestDataFromModule } from '../testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { SubmissionDbService } from './submission-db.service';
import { sendBitcoinToMockAddress } from '../crypto';
import { MongoService } from '../db';

describe('submission-controller', () => {
  let controller: SubmissionController;
  let holdingsDbService: CustomerHoldingsDbService;
  let submissionDbService: SubmissionDbService;
  let mongoService: MongoService;
  let module: TestingModule;
  let initialSubmission: SubmissionStatusDto;

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    controller = module.get<SubmissionController>(SubmissionController);
    submissionDbService = module.get<SubmissionDbService>(SubmissionDbService);
    holdingsDbService = module.get<CustomerHoldingsDbService>(CustomerHoldingsDbService);
    mongoService = module.get<MongoService>(MongoService);

    initialSubmission = await controller.submitHoldings({
      exchangeName: 'Exchange 1',
      customerHoldings: [
        {
          hashedEmail: 'hash-customer-1@mail.com',
          amount: 1000
        },
        {
          hashedEmail: 'hash-customer-2@mail.com',
          amount: 2000
        }
      ]
    });
  });

  afterEach(async () => {
    await module.close();
  });

  it('should submit holdings', async () => {
    expect(initialSubmission.submissionStatus).toBe(
      SubmissionStatus.WAITING_FOR_PAYMENT
    );
    const customer1Holdings = await holdingsDbService.findOne({ hashedEmail: 'hash-customer-1@mail.com' });
    expect(customer1Holdings.amount).toBe(1000);
    expect(customer1Holdings.submissionAddress).toBe(initialSubmission.paymentAddress);
    const customer2Holdings = await holdingsDbService.findOne({
      hashedEmail: 'hash-customer-2@mail.com'
    });
    expect(customer2Holdings.amount).toBe(2000);
    const submission = await submissionDbService.findOne({
      paymentAddress: initialSubmission.paymentAddress
    });
    expect(submission.submissionStatus).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submission.paymentAmount).toBe(30);
  });

  it('should get waiting submission status', async () => {
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.paymentAddress).toBe(initialSubmission.paymentAddress);
    expect(submissionStatus.paymentAmount).toBe(30);
    expect(submissionStatus.submissionStatus).toBe(SubmissionStatus.WAITING_FOR_PAYMENT
    );
  });

  it('should complete submissions if payment large enough', async () => {
    await sendBitcoinToMockAddress(mongoService, 'exchange-address-1', initialSubmission.paymentAddress, 30);
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.submissionStatus).toBe(SubmissionStatus.COMPLETE);
  });

  it('should not complete if payment too small', async () => {
    await sendBitcoinToMockAddress(mongoService, 'exchange-address-1', initialSubmission.paymentAddress, 1);
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.submissionStatus).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
  });
});
