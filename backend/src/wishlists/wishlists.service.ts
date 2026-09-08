import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import { wishlists, wishlistsProducts } from '@app/infrastructure/db/schema';
import type { Db } from '@app/infrastructure/db/schema.types';
import {
  REDIS_CACHE_TTL_SECONDS,
  REDIS_CLIENT,
} from '@app/infrastructure/redis/redis.constants';
import { RedisService } from '@app/infrastructure/redis/redis.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import Redis from 'ioredis';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @Inject(DB_CLIENT) private readonly db: Db,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly redisService: RedisService,
  ) {}

  async findAll() {
    const key = 'wishlists';
    const cachedWishlists = await this.redis.get(key);

    if (cachedWishlists) {
      return JSON.parse(cachedWishlists);
    }

    const wishlists = await this.db.query.wishlists.findMany();

    await this.redis.setex(
      key,
      REDIS_CACHE_TTL_SECONDS,
      JSON.stringify(wishlists),
    );

    return wishlists;
  }

  async findOne(wishlistId: string) {
    const key = `wishlists:${wishlistId}`;
    const cachedWishlist = await this.redis.get(key);

    if (cachedWishlist) {
      return JSON.parse(cachedWishlist);
    }

    const wishlist = await this.db.query.wishlists.findFirst({
      where: {
        id: wishlistId,
      },
      with: { products: true },
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with id ${wishlistId} not found`);
    }

    await this.redis.setex(
      key,
      REDIS_CACHE_TTL_SECONDS,
      JSON.stringify(wishlist),
    );

    return wishlist;
  }

  async update(wishlistId: string, updateWishlistDto: UpdateWishlistDto) {
    const [wishlist] = await this.db
      .update(wishlists)
      .set(updateWishlistDto)
      .where(eq(wishlists.id, wishlistId))
      .returning();

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with id ${wishlistId} not found`);
    }

    await this.redisService.invalidateCacheByKeys([
      'wishlists',
      `wishlists:${wishlistId}`,
      `wishlists:users:${wishlist.userId}`,
    ]);

    return wishlist;
  }

  async remove(wishlistId: string) {
    const [deletedWishlist] = await this.db
      .delete(wishlists)
      .where(eq(wishlists.id, wishlistId))
      .returning({
        id: wishlists.id,
        userId: wishlists.userId,
      });

    if (!deletedWishlist) {
      throw new NotFoundException(`Wishlist with id ${wishlistId} not found`);
    }

    await this.redisService.invalidateCacheByKeys([
      'wishlists',
      `wishlists:${wishlistId}`,
      `wishlists:users:${deletedWishlist.userId}`,
    ]);
  }

  async findUserWishlist(userId: string) {
    const key = `wishlists:users:${userId}`;
    const cachedWishlist = await this.redis.get(key);

    if (cachedWishlist) {
      return JSON.parse(cachedWishlist);
    }

    const wishlist = await this.db.query.wishlists.findFirst({
      where: {
        userId,
      },
      with: {
        products: true,
      },
    });

    if (!wishlist) {
      throw new NotFoundException(
        `Wishlist not found for user with id ${userId}`,
      );
    }

    await this.redis.setex(
      key,
      REDIS_CACHE_TTL_SECONDS,
      JSON.stringify(wishlist),
    );

    return wishlist;
  }

  async addProductToWishlist(userId: string, productId: string) {
    const wishlist = await this.db.query.wishlists.findFirst({
      where: {
        userId,
      },
      columns: {
        id: true,
      },
    });

    if (!wishlist) {
      throw new NotFoundException(
        `Wishlist not found for user with id ${userId}`,
      );
    }

    const product = await this.db.query.products.findFirst({
      where: {
        id: productId,
      },
      columns: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    await this.db
      .insert(wishlistsProducts)
      .values({
        wishlistId: wishlist.id,
        productId,
      })
      .onConflictDoNothing({
        target: [wishlistsProducts.wishlistId, wishlistsProducts.productId],
      });

    await this.redisService.invalidateCacheByKeys([
      'wishlists',
      `wishlists:${wishlist.id}`,
      `wishlists:users:${userId}`,
    ]);

    return this.db.query.wishlists.findFirst({
      where: { id: wishlist.id },
      with: { products: true },
    });
  }

  async removeProductFromWishlist(userId: string, productId: string) {
    const wishlist = await this.db.query.wishlists.findFirst({
      where: {
        userId,
      },
      columns: {
        id: true,
      },
    });

    if (!wishlist) {
      throw new NotFoundException(
        `Wishlist not found for user with id ${userId}`,
      );
    }

    const product = await this.db.query.products.findFirst({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const updatedWishlist = await this.db.transaction(async (tx) => {
      const [deletedResult] = await tx
        .delete(wishlistsProducts)
        .where(
          and(
            eq(wishlistsProducts.wishlistId, wishlist.id),
            eq(wishlistsProducts.productId, productId),
          ),
        )
        .returning();

      if (!deletedResult) {
        throw new NotFoundException(
          `Product with id ${productId} not found in wishlist with id ${wishlist.id}`,
        );
      }

      return await tx.query.wishlists.findFirst({
        where: { id: wishlist.id },
        with: { products: true },
      });
    });

    await this.redisService.invalidateCacheByKeys([
      'wishlists',
      `wishlists:${wishlist.id}`,
      `wishlists:users:${userId}`,
    ]);

    return updatedWishlist;
  }

  async clearWishlist(userId: string) {
    const wishlist = await this.db.query.wishlists.findFirst({
      where: {
        userId,
      },
      columns: {
        id: true,
      },
    });

    if (!wishlist) {
      throw new NotFoundException(
        `Wishlist not found for user with id ${userId}`,
      );
    }

    await this.db
      .delete(wishlistsProducts)
      .where(eq(wishlistsProducts.wishlistId, wishlist.id));

    await this.redisService.invalidateCacheByKeys([
      'wishlists',
      `wishlists:${wishlist.id}`,
      `wishlists:users:${userId}`,
    ]);

    return await this.db.query.wishlists.findFirst({
      where: {
        id: wishlist.id,
      },
    });
  }
}
