import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import { wishlists, wishlistsProducts } from '@app/infrastructure/db/schema';
import type { Db } from '@app/infrastructure/db/schema.types';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(@Inject(DB_CLIENT) private readonly db: Db) {}

  async findAll() {
    return this.db.query.wishlists.findMany();
  }

  async findOne(wishlistId: string) {
    const wishlist = await this.db.query.wishlists.findFirst({
      where: {
        id: wishlistId,
      },
      with: { products: true },
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with id ${wishlistId} not found`);
    }

    return wishlist;
  }

  async update(wishlistId: string, updateWishlistDto: UpdateWishlistDto) {
    const [wishlist] = await this.db
      .update(wishlists)
      .set(updateWishlistDto)
      .where(eq(wishlists.id, wishlistId))
      .returning();

    return wishlist;
  }

  async remove(wishlistId: string) {
    this.db.delete(wishlists).where(eq(wishlists.id, wishlistId));
  }

  async findUserWishlist(userId: string) {
    return this.db.query.wishlists.findFirst({
      where: {
        userId,
      },
      with: {
        products: true,
      },
    });
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

    return await this.db.transaction(async (tx) => {
      await tx
        .delete(wishlistsProducts)
        .where(
          and(
            eq(wishlistsProducts.wishlistId, wishlist.id),
            eq(wishlistsProducts.productId, productId),
          ),
        );

      return await tx.query.wishlists.findFirst({
        where: { id: wishlist.id },
        with: { products: true },
      });
    });
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

    return await this.db.query.wishlists.findFirst({
      where: {
        id: wishlist.id,
      },
    });
  }
}
