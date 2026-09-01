import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class AddProductToCartDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  quantity: number = 1;
}
