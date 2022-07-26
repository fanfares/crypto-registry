import { createNestApp } from './create-nest-app';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');
  const app = await createNestApp();
  await app.listen(3000);
  // app.use(express.json({limit: '50mb'}));
  // app.use(express.urlencoded({limit: '50mb', extended: true}));
  // app.use(compression());
  // app.use(cookieParser());
}

bootstrap();

