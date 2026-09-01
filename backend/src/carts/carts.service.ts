import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import { carts, items, wishlistsProducts } from '@app/infrastructure/db/schema';
import type { Db } from '@app/infrastructure/db/schema.types';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { AddProductToCartDto } from './add-product-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartsService {
  constructor(@Inject(DB_CLIENT) private readonly db: Db) {}

  async findAll() {
    return this.db.query.carts.findMany();
  }

  async findOne(cartId: string) {
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

    return cart;
  }

  async update(cartId: string, updateCartDto: UpdateCartDto) {
    await this.db.update(carts).set(updateCartDto).where(eq(carts.id, cartId));

    return this.findOne(cartId);
  }

  async remove(cartId: string) {
    this.db.delete(carts).where(eq(carts.id, cartId));
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

    return await this.db.transaction(async (tx) => {
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

    return await this.db.transaction(async (tx) => {
      const [deletedItem] = await tx
        .delete(items)
        .where(and(eq(items.cartId, cart.id), eq(items.productId, productId)))
        .returning({ quantity: items.quantity });

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

    return await this.db.transaction(async (tx) => {
      await tx.delete(items).where(eq(items.cartId, cart.id));

      const [updatedcart] = await tx
        .update(carts)
        .set({ totalCost: 0 })
        .where(eq(carts.id, cart.id))
        .returning();

      return updatedcart;
    });
  }

  async findUserCart(userId: string) {
    return this.db.query.carts.findFirst({
      where: { userId },
      with: { items: true },
    });
  }
}
