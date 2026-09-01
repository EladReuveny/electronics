import type { Item } from "../items/item.types";
import type { User } from "../users/user.types";

export type Order = {
  id: string;
  totalCost: number;
  status: Status;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  items: Item[];
};

export type Status = "PENDING" | "PACKAGING" | "DELIVERED" | "CANCELED";

export type CreateOrderDto = Pick<Order, "shippingAddress">;

export type UpdateOrderDto = Partial<CreateOrderDto> & {
  status?: Status;
};
