import { api } from "../../lib/api/api.config";
import type { Cart } from "../carts/cart.types";
import type { Order } from "../orders/order.types";
import type { Wishlist } from "../wishlists/wishlist.types";
import type { Role, User } from "./user.types";

const RESOURCE_PREFIX = "users";

export const usersApi = {
  findAll: async (): Promise<User[]> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}`);
    return data;
  },
  findMe: async (): Promise<Omit<User, "password">> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/me`);
    return data;
  },
  update: async (userId: string, formData: FormData): Promise<User> => {
    const { data } = await api.patch(`${RESOURCE_PREFIX}/${userId}`, formData);
    return data;
  },
  updateUserRole: async (
    userId: string,
    role: Role,
  ): Promise<{ message: string }> => {
    const { data } = await api.patch(`${RESOURCE_PREFIX}/${userId}/role`, {
      role,
    });
    return data;
  },
  remove: async (userId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`${RESOURCE_PREFIX}/${userId}/delete`);
    return data;
  },
  findUserOrders: async (userId: string): Promise<Order[]> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/${userId}/orders`);
    return data;
  },
  findUserWishlist: async (userId: string): Promise<Wishlist> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/${userId}/wishlists`);
    return data;
  },
  findUserCart: async (userId: string): Promise<Cart> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/${userId}/carts`);
    return data;
  },
  findUsersCount: async (): Promise<{ usersCount: number }> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/count`);
    return data;
  },
};
