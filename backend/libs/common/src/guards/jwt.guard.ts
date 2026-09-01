import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../../../../src/auth/types/auth.types';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(req);

    if (!token) {
      throw new UnauthorizedException('Invalid or missing token.');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      req['user'] = payload;

      return true;
    } catch (err: unknown) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
  private extractTokenFromCookie(req: Request) {
    return req.cookies?.['access-token'];
  }
}
