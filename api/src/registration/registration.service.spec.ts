import { createTestDataFromModule, createTestModule } from '../testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { DbService } from '../db/db.service';
import { RegistrationService } from './registration.service';
import { ApprovalStatus } from '../types/registration.db';
import { MockMailService } from '../mail-service/mock-mail-service';
import { MailService } from '../mail-service';
import { getTokenFromLink } from '../utils/get-token-from-link';

describe('submission-controller', () => {
  let dbService: DbService;
  let registrationService: RegistrationService;
  let mailService: MockMailService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await createTestModule();
    await createTestDataFromModule(module);
    dbService = module.get<DbService>(DbService);
    registrationService = module.get<RegistrationService>(RegistrationService);
    mailService = module.get<MailService>(MailService) as any as MockMailService;
  });

  afterEach(async () => {
    await module.close();
  });

  test('registration workflow', async () => {

    await dbService.registrations.insert({
      status: ApprovalStatus.approved,
      name: 'Genesis Node',
      email: 'name@email.com',
      verified: true
    });

    await registrationService.register({
      email: 'head@ftx.com',
      name: 'FTX'
    });

    const verificationToken = getTokenFromLink(mailService.link);
    await registrationService.verify(verificationToken);

    let registration = await dbService.registrations.findOne({ email: 'head@ftx.com' });
    expect(registration.status).toBe(ApprovalStatus.inProgress);

    await registrationService.approve(getTokenFromLink(mailService.link), true);
    registration = await dbService.registrations.findOne({ email: 'head@ftx.com' });
    expect(registration.status).toBe(ApprovalStatus.approved);

    const registrationStatusDto = await registrationService.getStatus(verificationToken);
    expect(registrationStatusDto.approvals.length).toBe(1);
    expect(registrationStatusDto.approvals[0].email).toBe('name@email.com');
    expect(registrationStatusDto.approvals[0].status).toBe(ApprovalStatus.approved);
  });

});
