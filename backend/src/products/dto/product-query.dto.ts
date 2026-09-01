import { categoryEnum } from '@app/infrastructure/db/schema';
import type { Category } from '@app/infrastructure/db/schema.types';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsIn(categoryEnum.enumValues)
  category?: Category;

  @IsOptional()
  @IsIn(['price-asc', 'price-desc', 'name-asc', 'name-desc'])
  orderBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
}
