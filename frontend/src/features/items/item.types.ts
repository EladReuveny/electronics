import type { Cart } from "../carts/cart.types";
import type { Order } from "../orders/order.types";
import type { Product } from "../products/product.types";

export type Item = {
  id: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  cart?: Cart;
  order?: Order;
};
