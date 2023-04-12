import {Network, SubmissionDto, SubmissionStatus} from '@bcr/types';
import {importSubmissionFile} from './import-submission-file';
import {minimumBitcoinPaymentInSatoshi} from '../utils';
import {exchangeMnemonic, faucetMnemonic, registryMnemonic} from '../crypto/exchange-mnemonic';
import {Bip84Account} from '../crypto/bip84-account';
import {TestNode} from '../network/test-node';
import {TestNetwork} from '../network/test-network';

describe('submission-controller', () => {
  let initialSubmission: SubmissionDto;
  const exchangeName = 'Exchange 1';
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);
  let node1: TestNode;
  let node2: TestNode;
  let network: TestNetwork;

  beforeEach(async () => {
    network = await TestNetwork.create(2);
    node1 = network.getNode(1);
    node2 = network.getNode(2);
    await network.setLeader(node1.address);

    initialSubmission = await node1.submissionController.createSubmission({
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
  });

  afterEach(async () => {
    await network.reset();
  });

  afterAll(async () => {
    await network.destroy();
  });


  test('mock payment address exists', async () => {
    const address = await node1.db.mockAddresses.findOne({
      address: initialSubmission.paymentAddress,
      zpub: registryZpub
    });
    expect(address).toBeDefined();
    expect(address.balance).toBe(0);
  });

  it('create submission', async () => {
    expect(initialSubmission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    const customer1Holdings = await node1.db.customerHoldings.findOne({
      hashedEmail: 'hash-customer-1@mail.com'
    });
    expect(customer1Holdings.amount).toBe(10000000);
    expect(customer1Holdings.paymentAddress).toBe(initialSubmission.paymentAddress);
    const customer2Holdings = await node1.db.customerHoldings.findOne({
      hashedEmail: 'hash-customer-2@mail.com'
    });
    expect(customer2Holdings.amount).toBe(20000000);
    const submission = await node1.db.submissions.findOne({
      paymentAddress: initialSubmission.paymentAddress
    });
    expect(submission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submission.exchangeName).toBe(exchangeName);
    expect(submission.totalCustomerFunds).toBe(30000000);
    expect(submission.totalExchangeFunds).toBe(30000000);
    expect(submission.paymentAmount).toBe(300000);
    expect(submission.isCurrent).toBe(true);

    const node2Submission = await node2.db.submissions.findOne({hash: submission.hash});
    expect(node2Submission).toBeDefined();

    await node2.walletService.sendFunds(exchangeZpub, initialSubmission.paymentAddress, initialSubmission.paymentAmount);
    await node2.submissionService.waitForSubmissionsForPayment()

    const submissionStatusDto = await node1.submissionService.getSubmissionStatus(submission.paymentAddress);
    expect(submissionStatusDto.confirmations.length).toBe(1);
    const node1Confirmation = submissionStatusDto.confirmations[0];
    expect(node1Confirmation.nodeAddress).toBe(node2.address);
    expect(node1Confirmation.confirmed).toBe(true);
  });

  it('should get waiting submission status', async () => {
    const submission = await node1.submissionController.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submission.paymentAddress).toBe(initialSubmission.paymentAddress);
    expect(submission.paymentAmount).toBe(300000);
    expect(submission.totalCustomerFunds).toBe(30000000);
    expect(submission.exchangeName).toBe(exchangeName);
    expect(submission.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
  });

  it('should complete submissions if payment large enough', async () => {
    await node1.walletService.sendFunds(exchangeZpub, initialSubmission.paymentAddress, 300000);
    await node1.submissionService.waitForSubmissionsForPayment()
    await node2.submissionService.waitForSubmissionsForPayment()
    const submissionStatus = await node1.submissionController.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.CONFIRMED);
  });

  it('throw exception with insufficient funds', async () => {
    await expect(node1.submissionController.createSubmission({
      initialNodeAddress: node1.address,
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'Hash-Customer-1@mail.com',
        amount: 100000000000
      }]
    })).rejects.toThrow('Exchange funds are below reserve limit (90% of customer funds)');
  });

  it('should not complete if payment too small', async () => {
    await node1.walletService.sendFunds(exchangeZpub, initialSubmission.paymentAddress, 100000);
    const submissionStatus = await node1.submissionController.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
  });

  it('should fail if sender is wrong', async () => {
    const wrongSenderZpub = Bip84Account.zpubFromMnemonic(faucetMnemonic);
    await node1.walletService.sendFunds(wrongSenderZpub, initialSubmission.paymentAddress, 300000);
    await node1.submissionService.waitForSubmissionsForPayment();
    const submissionStatus = await node1.submissionController.getSubmissionStatus(initialSubmission.paymentAddress);
    expect(submissionStatus.status).toBe(SubmissionStatus.SENDER_MISMATCH);
  });

  it('should cancel submission', async () => {
    await node1.submissionController.cancelSubmission({address: initialSubmission.paymentAddress});
    const submission = await node1.db.submissions.findOne({paymentAddress: initialSubmission.paymentAddress});
    expect(submission.status).toBe(SubmissionStatus.CANCELLED);
  });

  it('minimum payment amount submission', async () => {
    const submission = await node1.submissionController.createSubmission({
      initialNodeAddress: node1.address,
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
    const submissionStatus = await importSubmissionFile(buffer, node1.submissionService, node1.senderService,
      exchangeZpub, 'Exchange 1', node1.address);
    expect(submissionStatus.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submissionStatus.totalCustomerFunds).toBe(11000000);
    expect(submissionStatus.paymentAmount).toBe(110000);

    const submissionRecord = await node1.db.submissions.findOne({paymentAddress: submissionStatus.paymentAddress});
    expect(submissionRecord.status).toBe(SubmissionStatus.WAITING_FOR_PAYMENT);
    expect(submissionRecord.paymentAmount).toBe(110000);
    expect(submissionRecord.totalCustomerFunds).toBe(11000000);

    const customerRecords = await node1.db.customerHoldings.find({paymentAddress: submissionStatus.paymentAddress});
    expect(customerRecords.length).toBe(2);
    expect(customerRecords[0].amount).toBe(1000000);
  });

  test('create new submission', async () => {
    const newSubmission = await node1.submissionController.createSubmission({
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

    expect(newSubmission.isCurrent).toBe(true);
    const newHoldings = await node1.db.customerHoldings.find({paymentAddress: newSubmission.paymentAddress});
    newHoldings.forEach(holding => expect(holding.isCurrent).toBe(true));

    const originalSubmission = await node1.db.submissions.findOne({paymentAddress: initialSubmission.paymentAddress});
    expect(originalSubmission.isCurrent).toBe(false);

    const originalHoldings = await node1.db.customerHoldings.find({paymentAddress: initialSubmission.paymentAddress});
    originalHoldings.forEach(holding => expect(holding.isCurrent).toBe(false));
  });

  test('submission contains payment address', async () => {
    const address = await node1.walletService.getReceivingAddress(registryZpub, 'Registry', Network.testnet);

    const newSubmission = await node1.submissionController.createSubmission({
      initialNodeAddress: node1.address,
      exchangeZpub: exchangeZpub,
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: 'hash-customer-1@mail.com',
        amount: 10000000
      }, {
        hashedEmail: 'hash-customer-2@mail.com',
        amount: 20000000
      }],
      paymentAddress: address
    });

    expect(newSubmission.paymentAddress).toBe(address);
  });

  test('insufficient funds at exchange', async () => {

    await expect(node1.submissionController.createSubmission({
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
    })).rejects.toThrow('Exchange funds are below reserve limit (90% of customer funds)');
  });

});
