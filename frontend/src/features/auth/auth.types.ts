import type { Role, User } from "../users/user.types";

export type JwtPayload = {
  sub: string;
  role: Role;
};

export type AuthUser = Pick<User, "id" | "email" | "role">;

export type LoginUserDto = Pick<User, "email" | "password">;

export type CreateUserDto = Pick<User, "email" | "password"> &
  Partial<Pick<User, "phone" | "address" | "avatarUrl">>;

export type ForgotPasswordDto = Pick<User, "email">;

export type ResetPasswordDto = {
  token: string;
  password: string;
  confirmPassword: string;
};
