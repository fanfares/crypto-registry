import { SubmissionRecord, SubmissionStatus } from '@bcr/types';
import { importSubmissionFile } from './import-submission-file';
import { minimumBitcoinPaymentInSatoshi } from '../utils';
import { exchangeMnemonic, faucetMnemonic, registryMnemonic } from '../crypto/exchange-mnemonic';
import { Bip84Account } from '../crypto/bip84-account';
import { TestNode } from '../network/test-node';
import { TestNetwork } from '../network/test-network';

describe('submission-controller', () => {
  let node1SubmissionRecord: SubmissionRecord;
  const exchangeName = 'Exchange 1';
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);
  let node1: TestNode;
  let node2: TestNode;
  let node3: TestNode;
  let network: TestNetwork;

  beforeEach(async () => {
    network = await TestNetwork.create(3);
    node1 = network.getNode(1);
    node2 = network.getNode(2);
    node3 = network.getNode(3);
    await network.setLeader(node1.address);

    const submissionDto = await node1.submissionController.createSubmission({
      initialNodeAddress: node1.address,
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'Hash-Customer-1@mail.com',
        amount: 10000000
      }, {
        hashedEmail: 'hash-customer-2@mail.com',
        amount: 20000000
      }]
    });

    node1SubmissionRecord = await node1.db.submissions.get(submissionDto._id);
  });

  afterEach(async () => {
    await network.reset();
  });

  afterAll(async () => {
    await network.destroy();
  });


  test('mock payment address exists', async () => {
    const address = await node1.db.mockAddresses.findOne({
      address: node1SubmissionRecord.paymentAddress,
      zpub: registryZpub
    });
    expect(address).toBeDefined();
    expect(address.balance).toBe(0);
  });

  it('create submission', async () => {
    expect(node1SubmissionRecord.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    const customer1Holdings = await node1.db.customerHoldings.findOne({
      hashedEmail: 'hash-customer-1@mail.com'
    });
    expect(customer1Holdings.amount).toBe(10000000);
    const customer2Holdings = await node1.db.customerHoldings.findOne({
      hashedEmail: 'hash-customer-2@mail.com'
    });
    expect(customer2Holdings.amount).toBe(20000000);
    expect(node1SubmissionRecord.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(node1SubmissionRecord.exchangeName).toBe(exchangeName);
    expect(node1SubmissionRecord.totalCustomerFunds).toBe(30000000);
    expect(node1SubmissionRecord.totalExchangeFunds).toBe(30000000);
    expect(node1SubmissionRecord.paymentAmount).toBe(300000);
    expect(node1SubmissionRecord.isCurrent).toBe(true);

    const node2Submission = await node2.db.submissions.findOne({hash: node1SubmissionRecord.hash});
    expect(node2Submission).toBeDefined();

    const node3Submission = await node3.db.submissions.findOne({hash: node1SubmissionRecord.hash});
    expect(node3Submission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(node3Submission.exchangeName).toBe(exchangeName);
    expect(node3Submission.totalCustomerFunds).toBe(30000000);
    expect(node3Submission.totalExchangeFunds).toBe(30000000);
    expect(node3Submission.paymentAmount).toBe(300000);
    expect(node3Submission.isCurrent).toBe(true);

    await node2.walletService.sendFunds(exchangeZpub, node1SubmissionRecord.paymentAddress, node1SubmissionRecord.paymentAmount);
    await node2.submissionService.waitForSubmissionsForPayment();

    const submissionStatusDto = await node1.submissionService.getSubmissionDto(node1SubmissionRecord._id);
    expect(submissionStatusDto.confirmations.length).toBe(1);
    const node1Confirmation = submissionStatusDto.confirmations[0];
    expect(node1Confirmation.nodeAddress).toBe(node2.address);
    expect(node1Confirmation.confirmed).toBe(true);
  });

  it('should get waiting submission status', async () => {
    // const submission = await node1.submissionController.getSubmissionStatusByAddress(submission.paymentAddress);
    expect(node1SubmissionRecord.paymentAddress).toBe(node1SubmissionRecord.paymentAddress);
    expect(node1SubmissionRecord.paymentAmount).toBe(300000);
    expect(node1SubmissionRecord.totalCustomerFunds).toBe(30000000);
    expect(node1SubmissionRecord.exchangeName).toBe(exchangeName);
    expect(node1SubmissionRecord.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
  });

  it('should complete submissions if payment large enough', async () => {
    await node1.walletService.sendFunds(exchangeZpub, node1SubmissionRecord.paymentAddress, 300000);
    await node1.submissionService.waitForSubmissionsForPayment();
    await node2.submissionService.waitForSubmissionsForPayment();
    await node3.submissionService.waitForSubmissionsForPayment();
    const submissionStatus = await node1.submissionController.getSubmissionStatusByAddress(node1SubmissionRecord.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.CONFIRMED);
  });

  it('should set status to insufficient funds', async () => {
    const submissionDto2 = await node1.submissionController.createSubmission({
      initialNodeAddress: node1.address,
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'Hash-Customer-1@mail.com',
        amount: 100000000000
      }]
    });
    const submission2 = await node1.submissionController.getSubmission(submissionDto2._id)
    expect(submission2.status).toBe(SubmissionStatus.INSUFFICIENT_FUNDS)
  });

  it('should not complete if payment too small', async () => {
    await node1.walletService.sendFunds(exchangeZpub, node1SubmissionRecord.paymentAddress, 100000);
    const submissionStatus = await node1.submissionController.getSubmissionStatusByAddress(node1SubmissionRecord.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
  });

  it('should fail if sender is wrong', async () => {
    const wrongSenderZpub = Bip84Account.zpubFromMnemonic(faucetMnemonic);
    await node1.walletService.sendFunds(wrongSenderZpub, node1SubmissionRecord.paymentAddress, 300000);
    await node1.submissionService.waitForSubmissionsForPayment();
    const submissionStatus = await node1.submissionController.getSubmissionStatusByAddress(node1SubmissionRecord.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.SENDER_MISMATCH);
  });

  it('should cancel submission', async () => {
    await node1.submissionController.cancelSubmission({id: node1SubmissionRecord._id});
    node1SubmissionRecord = await node1.db.submissions.findOne({paymentAddress: node1SubmissionRecord.paymentAddress});
    expect(node1SubmissionRecord.status).toBe(SubmissionStatus.CANCELLED);
  });

  it('minimum payment amount submission', async () => {
    const submissionDto2 = await node1.submissionController.createSubmission({
      initialNodeAddress: node1.address,
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'hash-customer-1@mail.com',
        amount: 10000
      }]
    });
    const submission = await node1.submissionService.getSubmissionDto(submissionDto2._id);
    expect(submission.paymentAmount).toBe(minimumBitcoinPaymentInSatoshi);
  });

  test('should import csv submissions', async () => {
    const data = 'email,amount\n' +
      'rob@excal.tv,1000000\n' +
      'robert.porter1@gmail.com@excal.tv,10000000';

    const buffer = Buffer.from(data, 'utf-8');
    const submissionDto2 = await importSubmissionFile(buffer, node1.submissionService, node1.senderService,
      exchangeZpub, 'Exchange 1', node1.address);
    const submission2 = await node1.submissionService.getSubmissionDto(submissionDto2._id);
    expect(submission2.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submission2.totalCustomerFunds).toBe(11000000);
    expect(submission2.paymentAmount).toBe(110000);

    const customerRecords = await node1.db.customerHoldings.find({submissionId: submissionDto2._id});
    expect(customerRecords.length).toBe(2);
    expect(customerRecords[0].amount).toBe(1000000);
  });

  test('create new submission', async () => {
    const submissionDto2 = await node1.submissionController.createSubmission({
      initialNodeAddress: node1.address,
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
    const submission2 = await node1.submissionService.getSubmissionDto(submissionDto2._id);

    expect(submission2.isCurrent).toBe(true);
    const newHoldings = await node1.db.customerHoldings.find({submissionId: submission2._id});
    newHoldings.forEach(holding => expect(holding.isCurrent).toBe(true));

    const originalSubmission = await node1.db.submissions.findOne({paymentAddress: node1SubmissionRecord.paymentAddress});
    expect(originalSubmission.isCurrent).toBe(false);

    const originalHoldings = await node1.db.customerHoldings.find({submissionId: node1SubmissionRecord._id});
    originalHoldings.forEach(holding => expect(holding.isCurrent).toBe(false));
  });

  test('insufficient funds at exchange', async () => {
    const submissionDto2 = await node1.submissionController.createSubmission({
      initialNodeAddress: node1.address,
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'Hash-Customer-1@mail.com',
        amount: 10000000000
      }, {
        hashedEmail: 'hash-customer-2@mail.com',
        amount: 20000000000
      }]
    });

    const submission2 = await node1.submissionService.getSubmissionDto(submissionDto2._id);
    expect(submission2.status).toBe(SubmissionStatus.INSUFFICIENT_FUNDS)
  });

});
