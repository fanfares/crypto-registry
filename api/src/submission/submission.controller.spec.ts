import { SubmissionController } from './submission.controller';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { SubmissionStatus, SubmissionStatusDto } from '@bcr/types';
import { createTestModule, createTestDataFromModule } from '../testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { SubmissionDbService } from './submission-db.service';
import { importSubmissionFile } from './import-submission-file';
import { SubmissionService } from './submission.service';
import { minimumBitcoinPaymentInSatoshi } from '../utils';
import { getZpubFromMnemonic } from '../crypto/get-zpub-from-mnemonic';
import { exchangeMnemonic, registryMnemonic, faucetMnemonic, testMnemonic } from '../crypto/test-wallet-mnemonic';
import { MockAddressDbService } from '../crypto';
import { WalletService } from '../crypto/wallet.service';

describe('submission-controller', () => {
  let controller: SubmissionController;
  let holdingsDbService: CustomerHoldingsDbService;
  let submissionDbService: SubmissionDbService;
  let submissionService: SubmissionService;
  let module: TestingModule;
  let initialSubmission: SubmissionStatusDto;
  let walletService: WalletService;
  let addressService: MockAddressDbService;
  const exchangeName = 'Exchange 1';
  const exchangeZpub = getZpubFromMnemonic(exchangeMnemonic, 'password', 'testnet');
  const registryZpub = getZpubFromMnemonic(registryMnemonic, 'password', 'testnet');

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    controller = module.get<SubmissionController>(SubmissionController);
    submissionDbService = module.get<SubmissionDbService>(SubmissionDbService);
    submissionService = module.get<SubmissionService>(SubmissionService);
    holdingsDbService = module.get<CustomerHoldingsDbService>(CustomerHoldingsDbService);
    walletService = module.get<WalletService>(WalletService);
    addressService = module.get<MockAddressDbService>(MockAddressDbService);

    initialSubmission = await controller.createSubmission({
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'hash-customer-1@mail.com',
        amount: 10000000
      }, {
        hashedEmail: 'hash-customer-2@mail.com',
        amount: 20000000
      }]
    });
  });

  afterEach(async () => {
    await module.close();
  });

  test('mock  payment address exists', async () => {
    const address = await addressService.findOne({
      address: initialSubmission.paymentAddress,
      zpub: registryZpub
    });
    expect(address).toBeDefined();
    expect(address.balance).toBe(0);
  });

  it('should submit holdings', async () => {
    expect(initialSubmission.status).toBe(
      SubmissionStatus.WAITING_FOR_PAYMENT
    );
    const customer1Holdings = await holdingsDbService.findOne({
      hashedEmail: 'hash-customer-1@mail.com'
    });
    expect(customer1Holdings.amount).toBe(10000000);
    expect(customer1Holdings.paymentAddress).toBe(initialSubmission.paymentAddress);
    const customer2Holdings = await holdingsDbService.findOne({
      hashedEmail: 'hash-customer-2@mail.com'
    });
    expect(customer2Holdings.amount).toBe(20000000);
    const submission = await submissionDbService.findOne({
      paymentAddress: initialSubmission.paymentAddress
    });
    expect(submission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submission.exchangeName).toBe(exchangeName);
    expect(submission.totalCustomerFunds).toBe(30000000);
    expect(submission.paymentAmount).toBe(300000);
  });

  it('should get waiting submission status', async () => {
    const submission = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submission.paymentAddress).toBe(initialSubmission.paymentAddress);
    expect(submission.paymentAmount).toBe(300000);
    expect(submission.totalCustomerFunds).toBe(30000000);
    expect(submission.exchangeName).toBe(exchangeName);
    expect(submission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
  });

  it('should complete submissions if payment large enough', async () => {
    await walletService.sendFunds(exchangeZpub, initialSubmission.paymentAddress, 300000);
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.VERIFIED);
  });

  it('should show insufficient funds if sending account too small', async () => {
    const faucetZpub = getZpubFromMnemonic(faucetMnemonic, 'password', 'testnet');
    const receivingAddress = await walletService.getReceivingAddress(faucetZpub, 'faucet');
    await walletService.sendFunds(exchangeZpub, receivingAddress, 10000000);
    await walletService.sendFunds(exchangeZpub, initialSubmission.paymentAddress, 300000);
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.INSUFFICIENT_FUNDS);
  });

  it('should not complete if payment too small', async () => {
    await walletService.sendFunds(exchangeZpub, initialSubmission.paymentAddress, 100000);
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
  });

  it('should fail if sender is wrong', async () => {
    const wrongSenderZpub = getZpubFromMnemonic(testMnemonic, 'password', 'testnet')
    await walletService.sendFunds(wrongSenderZpub, initialSubmission.paymentAddress, 300000);
    const submissionStatus = await controller.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.SENDER_MISMATCH);
  });

  it('should cancel submission', async () => {
    await controller.cancelSubmission({ address: initialSubmission.paymentAddress });
    const submission = await submissionDbService.findOne({ paymentAddress: initialSubmission.paymentAddress });
    expect(submission.status).toBe(SubmissionStatus.CANCELLED);
  });

  it('minimum payment amount submission', async () => {
    const submission = await controller.createSubmission({
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'hash-customer-1@mail.com',
        amount: 10000
      }]
    });
    expect(submission.paymentAmount).toBe(minimumBitcoinPaymentInSatoshi);
  });

  test('should import csv submissions', async () => {
    const data = 'email,amount\n' +
      'rob@excal.tv,1000000\n' +
      'robert.porter1@gmail.com@excal.tv,10000000';

    const buffer = Buffer.from(data, 'utf-8');
    const submissionStatus = await importSubmissionFile(buffer, submissionService, exchangeZpub, 'Exchange 1');
    expect(submissionStatus.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submissionStatus.totalCustomerFunds).toBe(11000000);
    expect(submissionStatus.paymentAmount).toBe(110000);

    const submissionRecord = await submissionDbService.findOne({ paymentAddress: submissionStatus.paymentAddress });
    expect(submissionRecord.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submissionRecord.paymentAmount).toBe(110000);
    expect(submissionRecord.totalCustomerFunds).toBe(11000000);

    const customerRecords = await holdingsDbService.find({ paymentAddress: submissionStatus.paymentAddress });
    expect(customerRecords.length).toBe(2);
    expect(customerRecords[0].amount).toBe(1000000);

  });
});
