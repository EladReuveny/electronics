import { orderStatusEnum } from '@app/infrastructure/db/schema';
import type { OrderStatus } from '@app/infrastructure/db/schema.types';
import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsIn(orderStatusEnum.enumValues)
  status?: OrderStatus;
}
