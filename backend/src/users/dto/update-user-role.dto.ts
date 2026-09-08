import { roleEnum } from '@app/infrastructure/db/schema';
import type { Role } from '@app/infrastructure/db/schema.types';
import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(roleEnum.enumValues)
  role!: Role;
}
