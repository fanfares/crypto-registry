import { createTestModule } from '../testing';
import { DbService } from '../db/db.service';
import { TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MockSendMailService } from '../mail-service';
import { SendMailService } from '../mail-service/send-mail-service';
import { getTokenFromLink } from '../utils/get-token-from-link';
import { MockMessageTransportService } from '../network/mock-message-transport.service';


describe('user-service', () => {
  let dbService: DbService;
  let authService: AuthService;
  let sendMailService: MockSendMailService;
  let module: TestingModule;
  const testEmail = 'test@mail.com';
  const testPassword = 'Crypto!2';

  beforeEach(async () => {
    const module = await createTestModule(new MockMessageTransportService(), 1);
    dbService = module.get<DbService>(DbService);
    authService = module.get<AuthService>(AuthService);
    sendMailService = module.get<SendMailService>(SendMailService) as MockSendMailService;
  });

  afterAll(async () => {
    await module.close();
  });

  test('user registration', async () => {
    await authService.registerUser({
      email: testEmail
    });
    const user = await dbService.users.findOne({email: testEmail});
    const token = getTokenFromLink(sendMailService.link);
    await authService.verifyUser({token});
    let signInTokens = await authService.resetPassword({token, password: testPassword});
    expect((await authService.getUserByToken(signInTokens.idToken))._id).toBe(user._id);
    signInTokens = await authService.signIn({email: testEmail, password: testPassword});
    expect((await authService.getUserByToken(signInTokens.idToken))._id).toBe(user._id);
    signInTokens = await authService.refreshToken(signInTokens.refreshToken);
    expect((await authService.getUserByToken(signInTokens.idToken))._id).toBe(user._id);
  });

});
