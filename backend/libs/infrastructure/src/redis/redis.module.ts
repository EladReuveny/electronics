import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Logger } from 'pino-nestjs';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService, Logger],
      useFactory: (configService: ConfigService, logger: Logger) => {
        const redis = new Redis(configService.getOrThrow<string>('REDIS_URL'));

        redis.on('connect', () => {
          logger.log('Connected to Redis');
        });

        redis.on('disconnect', () => {
          logger.log('Disconnected from Redis');
        });

        redis.on('error', (err) => {
          logger.error(`Redis error: ${err}`);
        });

        return redis;
      },
    },
    RedisService,
  ],
  controllers: [],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
