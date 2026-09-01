import { Role, User } from '@app/infrastructure/db/schema.types';

export type JwtPayload = {
  sub: string;
  role: Role;
};

export type AuthUser = Pick<User, 'id' | 'email' | 'role'>;
