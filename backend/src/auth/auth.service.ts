import { NotificationsService } from '@app/infrastructure/notifications/notifications.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Logger } from 'pino-nestjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthUser, JwtPayload } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly logger: Logger,
  ) {}

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: AuthUser; accessToken: string }> {
    const user = await this.usersService.findUserByEmail(loginUserDto.email);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials. Email or password are incorrect.',
      );
    }

    const isValidPassword = await this.validatePassword(
      loginUserDto.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException(
        'Invalid credentials. Email or password are incorrect',
      );
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    return {
      user: this.usersService.sanitizeUser(user),
      accessToken: await this.generateJwtToken(payload),
    };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: AuthUser; accessToken: string }> {
    const user = await this.usersService.findUserByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException(
        `User with email ${user.email} already exists`,
      );
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    if (!newUser) {
      throw new InternalServerErrorException('Failed to create user');
    }

    try {
      await this.notificationsService.sendWelcomeEmail(newUser.email);
    } catch (err: unknown) {
      this.logger.error(`Failed to send welcome email: ${err}`);
    }

    const payload: JwtPayload = {
      sub: newUser.id,
      role: newUser.role,
    };

    return {
      user: this.usersService.sanitizeUser(newUser),
      accessToken: await this.generateJwtToken(payload),
    };
  }

  private async validatePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  private async generateJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findUserByEmail(email);

    if (user) {
      try {
        await this.notificationsService.sendPasswordResetEmail(user);
      } catch (err: unknown) {
        this.logger.error(
          `Failed to send password reset email to user with email ${email}: ${err}`,
        );
      }
    }

    return {
      message: `If an account with email ${email} exists, a password reset email has been sent`,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const decoded = this.jwtService.decode<{
      sub?: string;
      action?: string;
    }>(token);

    if (!decoded?.sub) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersService.findMe(decoded.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const systemSecret = this.configService.getOrThrow<string>('JWT_SECRET');

    const dynamicSecret = `${systemSecret}-${user.password}`;

    let payload: JwtPayload & { action: string };

    try {
      payload = this.jwtService.verify<JwtPayload & { action: string }>(token, {
        secret: dynamicSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.sub !== user.id || payload.action !== 'reset-password') {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await this.usersService.update(user.id, {
      password,
    });

    return {
      message: 'Password has been reset successfully',
    };
  }
}
