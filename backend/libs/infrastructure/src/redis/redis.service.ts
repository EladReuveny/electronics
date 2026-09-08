import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async deleteKeysByPattern(pattern: string): Promise<void> {
    const stream = this.redis.scanStream({ match: pattern, count: 100 });
    const pipeline = this.redis.pipeline();
    let found = false;

    for await (const keys of stream) {
      if (keys.length) {
        found = true;
        keys.forEach((key: string) => pipeline.del(key));
      }
    }

    if (found) await pipeline.exec();
  }

  async invalidateCacheByKeys(keys: string[]) {
    await this.redis.del(...keys);
  }
}
