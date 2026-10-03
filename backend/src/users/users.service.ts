import { CloudinaryService } from '@app/infrastructure/cloudinary/cloudinary.service';
import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import {
  REDIS_CACHE_TTL_SECONDS,
  REDIS_CLIENT,
} from '@app/infrastructure/redis/redis.constants';
import { RedisService } from '@app/infrastructure/redis/redis.service';
import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { count, eq } from 'drizzle-orm';
import Redis from 'ioredis';
import { Logger } from 'pino-nestjs';
import {
  carts,
  users,
  wishlists,
} from '../../libs/infrastructure/src/db/schema';
import type { Db, User } from '../../libs/infrastructure/src/db/schema.types';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { AuthUser } from '../auth/types/auth.types';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FILE_UPLOAD_AVATARS_FOLDER } from '@app/infrastructure/cloudinary/cloudinary.constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CLIENT)
    private readonly db: Db,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly redisService: RedisService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}

  async findUserByEmail(email: string) {
    const key = `users:email:${email}`;
    const cachedUser = await this.redis.get(key);

    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await this.db.query.users.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      await this.redis.setex(
        key,
        REDIS_CACHE_TTL_SECONDS,
        JSON.stringify(user),
      );
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(createUserDto).returning();

      await tx.insert(wishlists).values({
        userId: user.id,
      });

      await tx.insert(carts).values({
        userId: user.id,
      });

      return tx.query.users.findFirst({ where: { id: user.id } });
    });

    await this.redisService.invalidateCacheByKeys(['users', 'users:count']);

    return user;
  }

  async findAll() {
    const key = 'users';
    const cachedUsers = await this.redis.get(key);

    if (cachedUsers) {
      return JSON.parse(cachedUsers);
    }

    const users = await this.db.query.users.findMany();

    await this.redis.setex(key, REDIS_CACHE_TTL_SECONDS, JSON.stringify(users));

    return users;
  }

  async findMe(userId: string): Promise<User> {
    const key = `users:${userId}`;
    const cachedUser = await this.redis.get(key);

    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await this.db.query.users.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    await this.redis.setex(key, REDIS_CACHE_TTL_SECONDS, JSON.stringify(user));

    return user;
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    avatarImage?: Express.Multer.File,
  ) {
    const formData: UpdateUserDto & { avatarUrl?: string } = {
      ...updateUserDto,
    };

    if (formData.password) {
      formData.password = await this.hashPassword(formData.password);
    }

    if (avatarImage) {
      try {
        const { secure_url } = await this.cloudinaryService.uploadFile(
          avatarImage,
          FILE_UPLOAD_AVATARS_FOLDER,
        );
        formData.avatarUrl = secure_url;
      } catch (err: unknown) {
        this.logger.error(
          `Failed to upload avatar image to Cloudinary: ${err}`,
        );
        throw new ServiceUnavailableException(
          `Failed to upload avatar image to Cloudinary: ${err}`,
        );
      }
    }

    const [updatedUser] = await this.db
      .update(users)
      .set(formData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    await this.redisService.invalidateCacheByKeys([
      'users',
      `users:${updatedUser?.id}`,
      `users:email:${updatedUser?.email}`,
    ]);

    return updatedUser;
  }

  async updateUserRole(
    userId: string,
    { role }: UpdateUserRoleDto,
  ): Promise<{ message: string }> {
    const userToUpdate = await this.findMe(userId);

    await this.db
      .update(users)
      .set({
        role,
      })
      .where(eq(users.id, userId));

    await this.redisService.invalidateCacheByKeys([
      'users',
      `users:${userId}`,
      `users:email:${userToUpdate.email}`,
    ]);

    return {
      message: `User with id ${userId} role updated to ${role}`,
    };
  }

  async remove(userId: string) {
    const [deletedUser] = await this.db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
      });

    if (!deletedUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    await this.redisService.invalidateCacheByKeys([
      'users',
      `users:${deletedUser.id}`,
      `users:email:${deletedUser.email}`,
      'users:count',
    ]);
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  sanitizeUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  sanitizeUserWithoutPassword(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;

    return rest;
  }

  async findUsersCount() {
    const key = 'users:count';
    const cachedUsersCount = await this.redis.get(key);

    if (cachedUsersCount) {
      return JSON.parse(cachedUsersCount);
    }

    const [result] = await this.db.select({ usersCount: count() }).from(users);

    await this.redis.setex(
      key,
      REDIS_CACHE_TTL_SECONDS,
      JSON.stringify(result),
    );

    return result;
  }
}
