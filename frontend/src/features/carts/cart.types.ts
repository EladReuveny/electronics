import type { Item } from "../items/item.types";
import type { User } from "../users/user.types";

export type Cart = {
  id: string;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  items: Item[];
};

export type CreateCartDto = {};

export type UpdateCartDto = Partial<CreateCartDto>;

export type AddProductToCartDto = {
  quantity?: number;
};
