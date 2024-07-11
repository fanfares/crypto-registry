import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db';
import { BitcoinController, WalletService } from './bitcoin-service';
import { ApiConfigService } from './api-config';
import { SystemController } from './system/system.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VerificationController, VerificationService } from './verification';
import { TestController } from './testing';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail-service';
import { SES } from 'aws-sdk';
import { ExchangeController } from './exchange';
import { DbService } from './db/db.service';
import { BitcoinServiceFactory } from './bitcoin-service/bitcoin-service-factory';
import { SignatureService } from './authentication/signature.service';
import { RegistrationService } from './registration/registration.service';
import { SendMailService } from './mail-service/send-mail-service';
import { RegistrationController } from './registration/registration.controller';
import { AuthController, AuthService } from './auth';
import { NodeService } from './node';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { InterceptLogger } from './utils/logging';
// import { SyncService } from './syncronisation/sync.service';
import { ControlService } from './control';
import { NetworkController } from './network/network.controller';
import { MessageSenderService } from './network/message-sender.service';
import { MessageReceiverService } from './network/message-receiver.service';
import { AxiosMessageTransportService } from './network/axios-message-transport.service';
import { MessageTransportService } from './network/message-transport.service';
import { NodeController } from './node/node.controller';
import { BitcoinCoreApiFactory } from './bitcoin-core-api/bitcoin-core-api-factory.service';
import { HoldingsSubmissionController, HoldingsSubmissionService } from './customer-holdings';
import { FundingAddressService, FundingController, FundingService } from './funding';
import { ExchangeService } from './exchange/exchange.service';
import { AuthenticateMiddleware } from './auth/authenticate-middleware';
import { TestService } from './testing/test.service';
import { UserSettingsController } from './user-settings';
import { UserSettingsService } from './user-settings/user-settings.service';
import { UserController, UserService } from './user';
import { ToolsController } from './tools/tools.controller';
import { FundingAddressController } from './funding/funding-address.controller';
import { ResetController } from './testing/reset.controller';
import { CommandService } from './command/command.service';

@Module({
  controllers: [
    HoldingsSubmissionController,
    FundingController,
    VerificationController,
    BitcoinController,
    SystemController,
    TestController,
    ExchangeController,
    NetworkController,
    RegistrationController,
    AuthController,
    UserController,
    NodeController,
    UserSettingsController,
    ToolsController,
    FundingAddressController,
    ResetController
  ],
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets', 'api-docs'),
      serveRoot: '/api-reference'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'client', 'dist'),
      exclude: ['/api*', '/api-reference*']
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.' + process.env.NODE_ENV
    }),
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          SES: new SES({
            region: config.get('AWS_SES_REGION'),
            credentials: {
              accessKeyId: config.get('AWS_SES_ACCESS_KEY_ID'),
              secretAccessKey: config.get('AWS_SES_SECRET_ACCESS_KEY_ID')
            }
          })
        },
        defaults: {
          from: config.get('OWNER_EMAIL')
        },
        template: {
          dir: join(process.cwd(), './src/mail-service/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [
    UserSettingsService,
    TestService,
    FundingAddressService,
    MessageSenderService,
    HoldingsSubmissionService,
    FundingService,
    ExchangeService,
    ControlService,
    NodeService,
    AuthService,
    UserService,
    ApiConfigService,
    MailService,
    DbService,
    MessageReceiverService,
    BitcoinCoreApiFactory,
    VerificationService,
    SignatureService,
    RegistrationService,
    SendMailService,
    CommandService,
    {
      provide: APP_INTERCEPTOR,
      useClass: InterceptLogger
    },
    {
      provide: MessageTransportService,
      useClass: AxiosMessageTransportService
    },
    WalletService, // not used in prod.
    BitcoinServiceFactory,
    {
      provide: MongoService,
      useFactory: async (
        configService: ApiConfigService) => {
        const mongoService = new MongoService(configService);
        await mongoService.connect();
        return mongoService;
      },
      inject: [ApiConfigService]
    },
    // SyncService
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(AuthenticateMiddleware)
    .forRoutes({path: 'funding-submission*', method: RequestMethod.ALL},
      {path: 'funding-address*', method: RequestMethod.ALL},
      {path: 'holdings-submission*', method: RequestMethod.ALL},
      {path: 'exchange*', method: RequestMethod.ALL},
      {path: 'bitcoin*', method: RequestMethod.ALL},
      {path: 'tools*', method: RequestMethod.ALL},
      {path: 'system/config', method: RequestMethod.ALL},
      {path: 'system/test-logger', method: RequestMethod.ALL},
      {path: 'test*', method: RequestMethod.ALL},
      {path: 'user*', method: RequestMethod.ALL},
      {path: 'node*', method: RequestMethod.ALL},
      {path: 'user-settings*', method: RequestMethod.ALL},
      {path: 'auth/send-invite/*', method: RequestMethod.ALL}
    );
  }

}
