import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../testing/create-test-app';
import supertest from 'supertest';
import {
  CreateUserDto,
  CredentialsDto,
  ResetPasswordDto,
  SignInDto,
} from '../types';
import { MockSendMailService } from '../mail-service';
import { SendMailService } from '../mail-service/send-mail-service';
import { getTokenFromLink } from '../utils/get-token-from-link';
import cookie from 'cookie';


describe('user-controller', () => {
  let app: INestApplication;
  let httpServer: any;
  let sendMailService: MockSendMailService;
  const testEmail = 'test@mail.com';
  const testPassword = 'Crypto!2';

  beforeEach(async () => {
    app = await createTestApp();
    httpServer = app.getHttpServer();
    sendMailService = app.get<SendMailService>(SendMailService) as MockSendMailService;
  });

  afterAll(async () => {
    await app.close();
  });

  test('guarded route', async () => {
    await supertest(httpServer)
      .post(`/api/test/generate-test-address-file`)
      .send({})
      .expect(403);
  });

  test('whole user workflow', async () => {
    const createUserDto: CreateUserDto = {
      email: testEmail,
      isSystemAdmin: false,
      exchangeId: 'any'
    };
    const res = await supertest(httpServer)
      .post(`/api/user`)
      .send(createUserDto)
      .expect(201);

    const userId = res.body.id

    await supertest(httpServer)
      .post(`/api/auth/send-invite/${userId}`)
      .send({})
      .expect(201);

    const token = getTokenFromLink(sendMailService.link);

    const resetPasswordData: ResetPasswordDto = {
      token, password: testPassword
    };
    await supertest(httpServer)
      .post(`/api/user/reset-password/`)
      .send(resetPasswordData)
      .expect(200);

    let ret = await supertest(httpServer)
      .post(`/api/user/reset-password/`)
      .send(resetPasswordData)
      .expect(200);

    let credentials: CredentialsDto = ret.body;
    let cookies = cookie.parse(ret.header['set-cookie'].toString());
    let refreshToken = cookies['refresh-token'];

    await supertest(app.getHttpServer())
      .get(`/api/test/guarded-route/`)
      .set('Cookie', `refresh-token=${refreshToken}`)
      .set({Authorization: 'Bearer ' + credentials.idToken})
      .expect(200);

    await supertest(app.getHttpServer())
      .post(`/api/user/sign-out/`)
      .expect(200);

    await supertest(app.getHttpServer())
      .get(`/api/test/guarded-route/`)
      .set({Authorization: 'Bearer ' + credentials.idToken})
      .expect(403);

    const signInData: SignInDto = {
      email: testEmail,
      password: testPassword
    };
    ret = await supertest(app.getHttpServer())
      .post(`/api/user/sign-in/`)
      .send(signInData)
      .expect(200);

    credentials = ret.body;
    cookies = cookie.parse(ret.header['set-cookie'].toString());
    refreshToken = cookies['refresh-token'];

    await supertest(app.getHttpServer())
      .get(`/api/test/guarded-route/`)
      .set('Cookie', `refresh-token=${refreshToken}`)
      .set({Authorization: 'Bearer ' + credentials.idToken})
      .expect(200);

  });

});
