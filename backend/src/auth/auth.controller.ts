import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { user, accessToken } = await this.authService.login(loginUserDto);

    res.cookie('access-token', accessToken, {
      httpOnly: true, // Inaccessible to client-side JS (prevents XSS token theft); browser still attaches it to requests automatically
      secure: this.configService.get<string>('NODE_ENV') === 'prod', // HTTPS only in production
      sameSite: 'lax', // Restricts cross-site cookie sending, helping mitigate CSRF
      maxAge: this.configService.get<number>('COOKIE_MAX_AGE_MS') ?? 604800000, // 7 days by default in milliseconds
    });

   return res.status(HttpStatus.OK).json(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const { user, accessToken } =
      await this.authService.register(createUserDto);

    res.cookie('access-token', accessToken, {
      httpOnly: true, // Inaccessible to client-side JS (prevents XSS token theft); browser still attaches it to requests automatically
      secure: this.configService.get<string>('NODE_ENV') === 'prod', // HTTPS only in production
      sameSite: 'lax', // Restricts cross-site cookie sending, helping mitigate CSRF
      maxAge: this.configService.get<number>('COOKIE_MAX_AGE_MS') ?? 604800000, // 7 days by default in milliseconds
    });

     return res.status(HttpStatus.CREATED).json(user);
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access-token');

    return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
