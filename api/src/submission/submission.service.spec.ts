import { SubmissionDto } from '@bcr/types';
import { exchangeMnemonic, registryMnemonic } from '../crypto/exchange-mnemonic';
import { Bip84Account } from '../crypto/bip84-account';
import { TestNode } from '../network/test-node';
import { TestNetwork } from '../network/test-network';

describe('submission-service', () => {
  let submissionDto: SubmissionDto;
  const exchangeName = 'Exchange 1';
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);
  const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);
  let node1: TestNode;
  let node2: TestNode;

  beforeEach(async () => {
    const network = await TestNetwork.create(2);
    node1 = network.getNode(1);
    node2 = network.getNode(2);
    await network.setLeader(node1.address)
  });

  afterEach(async () => {
    await node1.module.close();
    await node2.module.close();
  });

  it('create submission', async () => {
    expect((await node1.nodeService.getThisNode()).isLeader).toBe(true);

    submissionDto = await node1.submissionService.createSubmission({
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

    const submissionRecordTestNode1 = await node1.db.submissions.findOne({
      _id: submissionDto._id
    });
    expect(submissionRecordTestNode1.index).toBe(0);

    const submissionRecordTestNode2 = await node2.db.submissions.findOne({
      _id: submissionDto._id
    });
    expect(submissionRecordTestNode2.index).toBe(0);
  });


});
