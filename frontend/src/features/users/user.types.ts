import type { CreateUserDto } from "../auth/auth.types";
import type { Cart } from "../carts/cart.types";
import type { Order } from "../orders/order.types";
import type { Wishlist } from "../wishlists/wishlist.types";

export type User = {
  id: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  cart: Cart;
  orders: Order[];
  wishlists: Wishlist[];
};

export type Role = "USER" | "ADMIN";

export type UpdateUserDto = Partial<CreateUserDto>;
