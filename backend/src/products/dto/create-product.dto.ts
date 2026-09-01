import { categoryEnum } from '@app/infrastructure/db/schema';
import type { Category } from '@app/infrastructure/db/schema.types';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsUrl()
  @IsNotEmpty()
  imageUrl!: string;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @IsIn(categoryEnum.enumValues)
  @IsOptional()
  category?: Category;
}
