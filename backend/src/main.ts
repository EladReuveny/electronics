import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger, LoggerErrorInterceptor } from 'pino-nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.use(helmet());
  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const PORT = configService.get<number>('PORT') ?? 3000;
  const SERVER_URL =
    configService.get<string>('SERVER_URL') ??
    `http://localhost:${PORT}/api/v1`;

  await app.listen(PORT, () => {
    logger.log(
      `Server is running on ${SERVER_URL} in ${configService.get<string>('NODE_ENV')} mode`,
    );
  });
}
bootstrap();
