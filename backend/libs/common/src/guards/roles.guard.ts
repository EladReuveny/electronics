import { Role } from '@app/infrastructure/db/schema.types';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from '../../../../src/auth/types/auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const user: JwtPayload | null = req['user'];

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const isAuthorized = requiredRoles.some((role) => user.role === role);

    if (!isAuthorized) {
      throw new ForbiddenException(
        'You do not have the required permissions to access this resource.',
      );
    }

    return true;
  }
}
