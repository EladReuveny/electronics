import { api } from "../../lib/api/api.config";
import type {
  AuthUser,
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
} from "./auth.types";

const RESOURCE_PREFIX = "auth";

export const authApi = {
  login: async (loginUserDto: LoginUserDto): Promise<AuthUser> => {
    const { data } = await api.post(`${RESOURCE_PREFIX}/login`, loginUserDto);
    return data;
  },
  register: async (createUserDto: CreateUserDto): Promise<AuthUser> => {
    const { data } = await api.post(
      `${RESOURCE_PREFIX}/register`,
      createUserDto,
    );
    return data;
  },
  logout: async (): Promise<{ message: string }> => {
    const { data } = await api.post(`${RESOURCE_PREFIX}/logout`);
    return data;
  },
  forgotPassword: async (
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> => {
    const { data } = await api.post(
      `${RESOURCE_PREFIX}/forgot-password`,
      forgotPasswordDto,
    );
    return data;
  },
  resetPassword: async (
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> => {
    const { data } = await api.post(
      `${RESOURCE_PREFIX}/reset-password`,
      resetPasswordDto,
    );
    return data;
  },
};
