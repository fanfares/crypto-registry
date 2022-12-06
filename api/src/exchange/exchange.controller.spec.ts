import { ExchangeController } from './exchange.controller';
import { CustomerHoldingsDbService } from '../customer';
import { SubmissionStatus, SubmissionStatusDto } from '@bcr/types';
import { createTestModule } from '../testing/create-test-module';
import { TestingModule } from '@nestjs/testing/testing-module';
import { createTestDataFromModule } from '../testing/create-test-data-from-module';
import { SubmissionDbService } from './submission-db.service';
import { sendBitcoinToMockAddress } from '../crypto/send-bitcoin-to-mock-address';
import { MongoService } from '../db/mongo.service';

describe('exchange-controller', () => {
  let controller: ExchangeController;
  let holdingsDbService: CustomerHoldingsDbService;
  let submissionDbService: SubmissionDbService;
  let mongoService: MongoService;
  let module: TestingModule;
  let initialSubmission: SubmissionStatusDto

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    controller = module.get<ExchangeController>(ExchangeController);
    submissionDbService = module.get<SubmissionDbService>(SubmissionDbService);
    holdingsDbService = module.get<CustomerHoldingsDbService>(CustomerHoldingsDbService);
    mongoService = module.get<MongoService>(MongoService);

    initialSubmission = await controller.submitHoldings({
      exchangeName: 'Exchange 1',
      customerHoldings: [{
        hashedEmail: 'customer-1@mail.com',
        amount: 1000
      }, {
        hashedEmail: 'customer-2@mail.com',
        amount: 2000
      }]
    });
  });

  afterAll(async () => {
    await module.close();
  });

  it('should submit holdings', async () => {
    expect(initialSubmission.submissionStatus).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    const customer1Holdings = await holdingsDbService.findOne({ hashedEmail: 'customer-1@mail.com' });
    expect(customer1Holdings.amount).toBe(1000);
    expect(customer1Holdings.submissionAddress).toBe(initialSubmission.paymentAddress)
    const customer2Holdings = await holdingsDbService.findOne({ hashedEmail: 'customer-2@mail.com' });
    expect(customer2Holdings.amount).toBe(2000);
    const submission = await submissionDbService.findOne({ paymentAddress: initialSubmission.paymentAddress});
    expect(submission.submissionStatus).toBe(SubmissionStatus.WAITING_FOR_PAYMENT)
    expect(submission.paymentAmount).toBe(30);
  });

  it('should get waiting submission status', async () => {
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.paymentAddress).toBe(initialSubmission.paymentAddress)
    expect(submissionStatus.paymentAmount).toBe(30)
    expect(submissionStatus.submissionStatus).toBe(SubmissionStatus.WAITING_FOR_PAYMENT)
  })

  it('should complete submissions if payment large enough', async () => {
    await sendBitcoinToMockAddress(mongoService, 'exchange-address-1', initialSubmission.paymentAddress, 30 )
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.submissionStatus).toBe(SubmissionStatus.COMPLETE)
  })

  it('should not complete if payment too small', async () => {
    await sendBitcoinToMockAddress(mongoService, 'exchange-address-1', initialSubmission.paymentAddress, 1 )
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.submissionStatus).toBe(SubmissionStatus.WAITING_FOR_PAYMENT)
  })
});
