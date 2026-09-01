import type { Product } from "../products/product.types";
import type { User } from "../users/user.types";

export type Wishlist = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  products: Product[];
};

export type CreateWishlistDto = {};

export type UpdateWishlistDto = Partial<CreateWishlistDto>;
