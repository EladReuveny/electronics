import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import { products } from '@app/infrastructure/db/schema';
import type { Db } from '@app/infrastructure/db/schema.types';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { count, countDistinct, eq, inArray } from 'drizzle-orm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@Inject(DB_CLIENT) private readonly db: Db) {}

  async create(createProductDto: CreateProductDto) {
    const [product] = await this.db
      .insert(products)
      .values(createProductDto)
      .returning();
    return product;
  }

  async findAll() {
    return this.db.query.products.findMany();
  }

  async findOne(productId: string) {
    const product = await this.db.query.products.findFirst({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return product;
  }

  async update(productId: string, updateProductDto: UpdateProductDto) {
    const [product] = await this.db
      .update(products)
      .set(updateProductDto)
      .where(eq(products.id, productId))
      .returning();

    return product;
  }

  async remove(productId: string) {
    this.db.delete(products).where(eq(products.id, productId));
  }

  async findProductsByQuery(query: ProductQueryDto) {
    const [sortField, sortOrder] = query.orderBy?.split('-') ?? [];

    return this.db.query.products.findMany({
      where: {
        name: query.q ? { ilike: `%${query.q}%` } : undefined,
        price: {
          gte: query.minPrice,
          lte: query.maxPrice,
        },
        stockQuantity: query.inStock ? { gt: 0 } : undefined,
        category: query.category ? { eq: query.category } : undefined,
      },
      orderBy: {
        [sortField]: sortOrder,
      },
    });
  }

  async removeSelectedProducts(productsIds: string[]) {
    await this.db.delete(products).where(inArray(products.id, productsIds));
  }

  async findProductsAndCategoriesCount() {
    const [result] = await this.db
      .select({
        productsCount: count(products.id),
        categoriesCount: countDistinct(products.category),
      })
      .from(products);

    return result;
  }
}
