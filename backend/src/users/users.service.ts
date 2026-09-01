import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { count, eq } from 'drizzle-orm';
import {
  carts,
  users,
  wishlists,
} from '../../libs/infrastructure/src/db/schema';
import type { Db, User } from '../../libs/infrastructure/src/db/schema.types';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { AuthUser } from '../auth/types/auth.types';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CLIENT)
    private readonly db: Db,
  ) {}

  async findUserByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: {
        email,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    return await this.db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(createUserDto).returning();

      await tx.insert(wishlists).values({
        userId: user.id,
      });

      await tx.insert(carts).values({
        userId: user.id,
      });

      return tx.query.users.findFirst({ where: { id: user.id } });
    });
  }

  async findAll() {
    return this.db.query.users.findMany();
  }

  async findMe(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    const [updatedUser] = await this.db
      .update(users)
      .set(updateUserDto)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async remove(userId: string) {
    await this.db.delete(users).where(eq(users.id, userId));
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

  async findUsersCount() {
    const [result] = await this.db.select({ usersCount: count() }).from(users);

    return result;
  }
}
