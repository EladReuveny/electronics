import { categoryEnum } from '@app/infrastructure/db/schema';
import type { Category } from '@app/infrastructure/db/schema.types';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @IsIn(categoryEnum.enumValues)
  @IsOptional()
  category?: Category;
}
