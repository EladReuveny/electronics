import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import { carts, items, wishlistsProducts } from '@app/infrastructure/db/schema';
import type { Db } from '@app/infrastructure/db/schema.types';
import {
  REDIS_CACHE_TTL_SECONDS,
  REDIS_CLIENT,
} from '@app/infrastructure/redis/redis.constants';
import { RedisService } from '@app/infrastructure/redis/redis.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { AddProductToCartDto } from './add-product-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @Inject(DB_CLIENT) private readonly db: Db,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly redisService: RedisService,
  ) {}

  async findAll() {
    const key = 'carts';
    const cachedCarts = await this.redis.get(key);

    if (cachedCarts) {
      return JSON.parse(cachedCarts);
    }

    const carts = await this.db.query.carts.findMany();

    await this.redis.setex(key, REDIS_CACHE_TTL_SECONDS, JSON.stringify(carts));

    return carts;
  }

  async findOne(cartId: string) {
    const key = `carts:${cartId}`;
    const cachedCart = await this.redis.get(key);

    if (cachedCart) {
      return JSON.parse(cachedCart);
    }

    const cart = await this.db.query.carts.findFirst({
      where: {
        id: cartId,
      },
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }

    await this.redis.setex(key, REDIS_CACHE_TTL_SECONDS, JSON.stringify(cart));

    return cart;
  }

  async update(cartId: string, updateCartDto: UpdateCartDto) {
    const [updatedCart] = await this.db
      .update(carts)
      .set(updateCartDto)
      .where(eq(carts.id, cartId))
      .returning({
        id: carts.id,
        userId: carts.userId,
      });

    if (!updatedCart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }

    await this.redisService.invalidateCacheByKeys( [
      'carts',
      `carts:${cartId}`,
      `carts:users:${updatedCart.userId}`,
    ]);

    return await this.findOne(cartId);
  }

  async remove(cartId: string) {
    const [deletedCart] = await this.db
      .delete(carts)
      .where(eq(carts.id, cartId))
      .returning({
        id: carts.id,
        userId: carts.userId,
      });

    if (!deletedCart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }

    await this.redisService.invalidateCacheByKeys([
      'carts',
      `carts:${cartId}`,
      `carts:users:${deletedCart.userId}`,
    ]);
  }

  async addProductToCart(
    userId: string,
    productId: string,
    addProductToCartDto: AddProductToCartDto,
  ) {
    const cart = await this.db.query.carts.findFirst({
      where: {
        userId,
      },
      columns: {
        id: true,
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user with id ${userId}`);
    }

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
      where: { id: productId },
      columns: { price: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const updatedCart = await this.db.transaction(async (tx) => {
      await tx
        .delete(wishlistsProducts)
        .where(
          and(
            eq(wishlistsProducts.wishlistId, wishlist.id),
            eq(wishlistsProducts.productId, productId),
          ),
        );

      await tx
        .insert(items)
        .values({
          cartId: cart.id,
          productId,
          quantity: addProductToCartDto.quantity,
        })
        .onConflictDoUpdate({
          target: [items.cartId, items.productId],
          set: {
            quantity: sql`${items.quantity} + ${addProductToCartDto.quantity}`,
          },
        });

      await tx
        .update(carts)
        .set({
          totalCost: sql`${carts.totalCost} + ${addProductToCartDto.quantity * product.price}`,
        })
        .where(eq(carts.id, cart.id));

      return tx.query.carts.findFirst({
        where: {
          id: cart.id,
        },
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });
    });

    await this.redisService.invalidateCacheByKeys(['carts', `carts:${cart.id}`, `carts:users:${userId}`]);

    return updatedCart;
  }

  async removeProductFromCart(userId: string, productId: string) {
    const cart = await this.db.query.carts.findFirst({
      where: {
        userId,
      },
      columns: {
        id: true,
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user with id ${userId}`);
    }

    const product = await this.db.query.products.findFirst({
      where: { id: productId },
      columns: { price: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const updatedCart = await this.db.transaction(async (tx) => {
      const [deletedItem] = await tx
        .delete(items)
        .where(and(eq(items.cartId, cart.id), eq(items.productId, productId)))
        .returning({ quantity: items.quantity });

      if (!deletedItem) {
        throw new NotFoundException(
          `Item with product id ${productId} not found in cart with id ${cart.id}`,
        );
      }

      await tx
        .update(carts)
        .set({
          totalCost: sql`${carts.totalCost} - ${product.price * deletedItem.quantity}`,
        })
        .where(eq(carts.id, cart.id));

      return tx.query.carts.findFirst({
        where: {
          id: cart.id,
        },
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });
    });

    await this.redisService.invalidateCacheByKeys(['carts', `carts:${cart.id}`, `carts:users:${userId}`]);

    return updatedCart;
  }

  async clearCart(userId: string) {
    const cart = await this.db.query.carts.findFirst({
      where: {
        userId,
      },
      columns: {
        id: true,
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user with id ${userId}`);
    }

    const updatedcart = await this.db.transaction(async (tx) => {
      await tx.delete(items).where(eq(items.cartId, cart.id));

      const [updatedcart] = await tx
        .update(carts)
        .set({ totalCost: 0 })
        .where(eq(carts.id, cart.id))
        .returning();

      return updatedcart;
    });

    await this.redisService.invalidateCacheByKeys(['carts', `carts:${cart.id}`, `carts:users:${userId}`]);

    return updatedcart;
  }

  async findUserCart(userId: string) {
    const key = `carts:users:${userId}`;
    const cachedCart = await this.redis.get(key);

    if (cachedCart) {
      return JSON.parse(cachedCart);
    }

    const cart = await this.db.query.carts.findFirst({
      where: { userId },
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user with id ${userId}`);
    }

    await this.redis.setex(key, REDIS_CACHE_TTL_SECONDS, JSON.stringify(cart));

    return cart;
  }
}
