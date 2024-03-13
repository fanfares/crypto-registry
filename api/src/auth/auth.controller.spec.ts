import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../testing/create-test-app';
import supertest from 'supertest';
import { CreateUserDto, CredentialsDto, ResetPasswordDto, SignInDto } from '../types';
import { MailService, MockMailService } from '../mail-service';
import { getTokenFromLink } from '../utils/get-token-from-link';
import cookie from 'cookie';
import { createAdminUser } from '../testing/create-admin-user';
import { DbService } from '../db/db.service';
import { testAdminCredentials } from '../testing/test-admin-email';


describe('auth-controller', () => {
  let app: INestApplication;
  let httpServer: any;
  let mockMailService: MockMailService;
  let db: DbService;
  const testEmail = 'test@mail.com';
  const testPassword = 'Crypto!2';

  beforeEach(async () => {
    app = await createTestApp();
    db = app.get<DbService>(DbService);
    await createAdminUser(db);
    httpServer = app.getHttpServer();
    mockMailService = app.get<MailService>(MailService) as MockMailService;
  });

  afterAll(async () => {
    await app.close();
  });

  test('unguarded route', async () => {
    const res = await supertest(httpServer)
    .get(`/api/system`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('guarded route', async () => {
    const res = await supertest(httpServer)
    .post(`/api/tools/generate-test-address-file`)
    .send({
      extendedPrivateKey: 'jnkjjn',
      message: 'sdff'
    })
    .expect(403);
  });

  test('whole user workflow', async () => {

    const loginRes = await supertest(httpServer)
    .post('/api/auth/sign-in')
    .send(testAdminCredentials)
    .expect(200)

    const cred: CredentialsDto = loginRes.body;

    const createUserDto: CreateUserDto = {
      email: testEmail,
      isSystemAdmin: false,
      exchangeId: 'any'
    };
    const res = await supertest(httpServer)
    .post(`/api/user`)
    .set('Authorization', `Bearer ${cred.idToken}`)
    .set('Cookie', ['refresh-token=any'])
    .send(createUserDto)
    .expect(201);

    const userId = res.body.id;

    await supertest(httpServer)
    .post(`/api/auth/send-invite/${userId}`)
    .set('Authorization', `Bearer ${cred.idToken}`)
    .set('Cookie', ['refresh-token=any'])
    .send({})
    .expect(201);

    const resetPasswordData: ResetPasswordDto = {
      token: mockMailService.token,
      password: testPassword
    };

    await supertest(httpServer)
    .post(`/api/auth/reset-password/`)
    .send(resetPasswordData)
    .expect(200);

    let ret = await supertest(httpServer)
    .post(`/api/auth/reset-password/`)
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
    .post(`/api/auth/sign-out/`)
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
    .post(`/api/auth/sign-in/`)
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
