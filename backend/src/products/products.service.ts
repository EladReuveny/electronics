import { FILE_UPLOAD_PRODUCTS_FOLDER } from '@app/infrastructure/cloudinary/cloudinary.constants';
import { CloudinaryService } from '@app/infrastructure/cloudinary/cloudinary.service';
import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import { products } from '@app/infrastructure/db/schema';
import type { Db } from '@app/infrastructure/db/schema.types';
import {
  REDIS_CACHE_TTL_SECONDS,
  REDIS_CLIENT,
} from '@app/infrastructure/redis/redis.constants';
import { RedisService } from '@app/infrastructure/redis/redis.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { count, countDistinct, eq, inArray } from 'drizzle-orm';
import Redis from 'ioredis';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DB_CLIENT) private readonly db: Db,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly redisService: RedisService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    productImage?: Express.Multer.File,
  ) {
    if (!createProductDto.imageUrl?.trim() && !productImage) {
      throw new BadRequestException(
        'Image URL is required or upload a product image file.',
      );
    }

    if (productImage) {
      try {
        const { secure_url } = await this.cloudinaryService.uploadFile(
          productImage,
          FILE_UPLOAD_PRODUCTS_FOLDER,
        );
        createProductDto.imageUrl = secure_url;
      } catch (err: unknown) {
        throw new ServiceUnavailableException(
          `Failed to upload product image to Cloudinary: ${err}`,
        );
      }
    }

    const [product] = await this.db
      .insert(products)
      .values({ ...createProductDto, imageUrl: createProductDto.imageUrl! })
      .returning();

    await this.redisService.deleteKeysByPattern('products*');

    return product;
  }

  async findAll() {
    const key = 'products';
    const cachedProducts = await this.redis.get(key);

    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    const products = await this.db.query.products.findMany();

    await this.redis.setex(
      key,
      REDIS_CACHE_TTL_SECONDS,
      JSON.stringify(products),
    );

    return products;
  }

  async findOne(productId: string) {
    const key = `products:${productId}`;
    const cachedProduct = await this.redis.get(key);

    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }

    const product = await this.db.query.products.findFirst({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    await this.redis.setex(
      key,
      REDIS_CACHE_TTL_SECONDS,
      JSON.stringify(product),
    );

    return product;
  }

  async update(
    productId: string,
    updateProductDto: UpdateProductDto,
    productImage?: Express.Multer.File,
  ) {
    if (productImage) {
      try {
        const { secure_url } = await this.cloudinaryService.uploadFile(
          productImage,
          FILE_UPLOAD_PRODUCTS_FOLDER,
        );
        updateProductDto.imageUrl = secure_url;
      } catch (err: unknown) {
        throw new ServiceUnavailableException(
          `Failed to upload product image to Cloudinary: ${err}`,
        );
      }
    }

    const [product] = await this.db
      .update(products)
      .set(updateProductDto)
      .where(eq(products.id, productId))
      .returning();

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    await this.redisService.deleteKeysByPattern('products*');

    return product;
  }

  async remove(productId: string) {
    const [deletedProduct] = await this.db
      .delete(products)
      .where(eq(products.id, productId))
      .returning({
        id: products.id,
      });

    if (!deletedProduct) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    await this.redisService.deleteKeysByPattern('products*');
  }

  async findProductsByQuery(query: ProductQueryDto) {
    const key = `products:query:${JSON.stringify(query)}`;
    const cachedProducts = await this.redis.get(key);

    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    const [sortField, sortOrder] = query.orderBy?.split('-') ?? [];

    const products = await this.db.query.products.findMany({
      where: {
        name: query.q ? { ilike: `%${query.q}%` } : undefined,
        price: {
          gte: query.minPrice,
          lte: query.maxPrice,
        },
        stockQuantity: query.inStock ? { gt: 0 } : undefined,
        category: query.category ? { eq: query.category } : undefined,
      },
      orderBy:
        sortField && sortOrder
          ? {
              [sortField]: sortOrder,
            }
          : undefined,
    });

    await this.redis.setex(
      key,
      REDIS_CACHE_TTL_SECONDS,
      JSON.stringify(products),
    );

    return products;
  }

  async removeSelectedProducts(productsIds: string[]) {
    const deletedProducts = await this.db
      .delete(products)
      .where(inArray(products.id, productsIds))
      .returning({
        id: products.id,
      });

    if (deletedProducts.length === 0) {
      throw new BadRequestException('No products found');
    }

    await this.redisService.deleteKeysByPattern('products*');
  }

  async findProductsAndCategoriesCount() {
    const key = 'products:stats';
    const cachedProductsCount = await this.redis.get(key);

    if (cachedProductsCount) {
      return JSON.parse(cachedProductsCount);
    }

    const [result] = await this.db
      .select({
        productsCount: count(products.id),
        categoriesCount: countDistinct(products.category),
      })
      .from(products);

    await this.redis.setex(
      key,
      REDIS_CACHE_TTL_SECONDS,
      JSON.stringify(result),
    );

    return result;
  }
}
