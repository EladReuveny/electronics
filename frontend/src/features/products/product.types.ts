import type { Item } from "../items/item.types";
import type { Wishlist } from "../wishlists/wishlist.types";

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  items: Item[];
  wishlists: Wishlist[];
};

export type Category = "SMART_PHONE" | "TABLET" | "LAPTOP" | "TV";

export type CreateProductDto = Pick<Product, "name" | "price" | "imageUrl"> &
  Partial<Pick<Product, "description" | "stockQuantity" | "category">>;

export type UpdateProductDto = Partial<CreateProductDto>;

export type ProductQueryDto = {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  category?: "SMART_PHONE" | "TABLET" | "LAPTOP" | "TV";
  orderBy?: "price-asc" | "price-desc" | "name-asc" | "name-desc";
};
