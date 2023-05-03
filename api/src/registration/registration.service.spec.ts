import { ApprovalStatus } from '../types/registration.types';
import { getTokenFromLink } from '../utils/get-token-from-link';
import { TestNode } from '../testing';

describe('registration-service', () => {
  let node1: TestNode;
  let node2: TestNode;

  beforeAll(async () => {
    node1 = await TestNode.createTestNode(1)
    node2 = await TestNode.createTestNode(2)
  });

  afterEach(async () => {
    await node1.reset(true);
    await node2.reset(true);
  })

  afterAll(async () => {
    await node1.destroy();
    await node2.destroy();
  });

  test('registration workflow', async () => {

    // First the new entrant registers on another node on the network
    await node1.registrationService.sendRegistration({
      toNodeAddress: 'http://node-2/'
    });

    let registration = await node2.db.registrations.findOne({email: node1.apiConfigService.ownerEmail});
    expect(registration.status).toBe(ApprovalStatus.pendingInitiation);

    // Registrant verifies their email on that node.
    // This triggers approval emails to be sent the owner of the local node
    const verificationToken = getTokenFromLink(node2.sendMailService.link);
    await node2.registrationService.verifyEmail(verificationToken);

    // Initiate the approvals
    await node2.registrationService.initiateApprovals(verificationToken);

    // Registration is recorded on node-2
    registration = await node2.db.registrations.findOne({email: node1.apiConfigService.ownerEmail});
    expect(registration.status).toBe(ApprovalStatus.pendingApproval);

    // Expect 1 approval to be required
    expect(await node2.db.approvals.count({})).toBe(1);

    // Approver is the email owner of node 2.
    const approval = await node2.db.approvals.findOne({registrationId: registration._id});
    expect(approval.email).toBe(node2.apiConfigService.ownerEmail);

    // Registering Nodes owner receives an email to approve/reject
    await node2.registrationService.approve(getTokenFromLink(node2.sendMailService.link), true);

    // Registration is approved.
    registration = await node2.db.registrations.findOne({email: node1.apiConfigService.ownerEmail});
    expect(registration.status).toBe(ApprovalStatus.approved);

    const registrationStatusDto = await node2.registrationService.getRegistrationStatus(verificationToken);
    expect(registrationStatusDto.approvals.length).toBe(1);
    expect(registrationStatusDto.approvals[0].email).toBe(node2.apiConfigService.ownerEmail);
    expect(registrationStatusDto.approvals[0].status).toBe(ApprovalStatus.approved);


    // Registering node should be visible in registered node
    expect(await node1.db.nodes.findOne({nodeName: 'node-2'})).toBeDefined();
    expect(await node1.db.nodes.findOne({nodeName: 'node-1'})).toBeDefined();

    // Registering node should be visible in registered node
    expect(await node2.db.nodes.findOne({nodeName: 'node-2'})).toBeDefined();
    expect(await node2.db.nodes.findOne({nodeName: 'node-1'})).toBeDefined();

    // Broadcast a text message
    await node2.senderService.broadcastPing(null, true);
  });

});
