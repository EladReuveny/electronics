import { NotificationsModule } from '@app/infrastructure/notifications/notifications.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'pino-nestjs';
import { DbModule } from '../libs/infrastructure/src/db/db.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { WishlistsModule } from './wishlists/wishlists.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level:
            configService.get<string>('NODE_ENV') !== 'prod' ? 'debug' : 'info',
          transport:
            configService.get<string>('NODE_ENV') !== 'prod'
              ? { target: 'pino-pretty' }
              : undefined,
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 1000 * 60, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    DbModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRATION_TIME') ??
            '7d') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
    UsersModule,
    AuthModule,
    NotificationsModule,
    ProductsModule,
    OrdersModule,
    WishlistsModule,
    CartsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
