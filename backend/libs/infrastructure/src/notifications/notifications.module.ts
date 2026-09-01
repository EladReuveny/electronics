import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Nodemailer from 'nodemailer';
import { NOTIFICATION_CLIENT } from './notifications.constants';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATION_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        Nodemailer.createTransport({
          host: configService.getOrThrow<string>('SMTP_HOST'),
          port: configService.getOrThrow<number>('SMTP_PORT'),
          auth: {
            user: configService.getOrThrow<string>('SMTP_USER'),
            pass: configService.getOrThrow<string>('SMTP_PASSWORD'),
          },
          from: {
            address: configService.getOrThrow<string>('SMTP_FROM'),
            name: configService.getOrThrow<string>('SMTP_FROM_NAME'),
          },
        }),
    },
  ],
  exports: [NotificationsService, NOTIFICATION_CLIENT],
})
export class NotificationsModule {}
