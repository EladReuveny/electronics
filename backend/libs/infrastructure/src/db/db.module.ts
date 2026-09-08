import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DB_CLIENT } from './db.constants';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: DB_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        });

        const db = drizzle({ client: pool, relations: schema.relations });

        return db;
      },
    },
  ],
  exports: [DB_CLIENT],
})
export class DbModule {}
