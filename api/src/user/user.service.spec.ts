import { createTestModule } from '../testing';
import { DbService } from '../db/db.service';
import { TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MockSendMailService } from '../mail-service';
import { SendMailService } from '../mail-service/send-mail-service';
import { getTokenFromLink } from '../utils/get-token-from-link';
import { MockMessageTransportService } from '../network/mock-message-transport.service';


describe('user-service', () => {
  let dbService: DbService;
  let userService: UserService;
  let sendMailService: MockSendMailService;
  let module: TestingModule;
  const testEmail = 'test@mail.com';
  const testPassword = 'Crypto!2';

  beforeEach(async () => {
    const module = await createTestModule(new MockMessageTransportService(), 1);
    dbService = module.get<DbService>(DbService);
    userService = module.get<UserService>(UserService);
    sendMailService = module.get<SendMailService>(SendMailService) as MockSendMailService;
  });

  afterAll(async () => {
    await module.close();
  });

  test('user registration', async () => {
    await userService.registerUser({
      email: testEmail
    });
    const user = await dbService.users.findOne({ email: testEmail });
    const token = getTokenFromLink(sendMailService.link);
    await userService.verifyUser({ token });
    let signInTokens = await userService.resetPassword({ token, password: testPassword });
    expect((await userService.getUserByToken(signInTokens.idToken))._id).toBe(user._id);
    signInTokens = await userService.signIn({ email: testEmail, password: testPassword });
    expect((await userService.getUserByToken(signInTokens.idToken))._id).toBe(user._id);
    signInTokens = await userService.refreshToken(signInTokens.refreshToken);
    expect((await userService.getUserByToken(signInTokens.idToken))._id).toBe(user._id);
  });

});
