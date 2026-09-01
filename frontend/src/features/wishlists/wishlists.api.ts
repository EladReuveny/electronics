import { api } from "../../lib/api/api.config";
import type { UpdateWishlistDto, Wishlist } from "./wishlist.types";

const RESOURCE_PREFIX = "wishlists";

export const wishlistsApi = {
  findAll: async (): Promise<Wishlist[]> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}`);
    return data;
  },
  findOne: async (wishlistId: string): Promise<Wishlist> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/${wishlistId}`);
    return data;
  },
  update: async (
    wishlistId: string,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> => {
    const { data } = await api.patch(
      `${RESOURCE_PREFIX}/${wishlistId}`,
      updateWishlistDto,
    );
    return data;
  },
  addProductToWishlist: async (productId: string): Promise<Wishlist> => {
    const { data } = await api.post(`${RESOURCE_PREFIX}/products/${productId}`);
    return data;
  },
  removeProductFromWishlist: async (productId: string): Promise<Wishlist> => {
    const { data } = await api.delete(
      `${RESOURCE_PREFIX}/products/${productId}`,
    );
    return data;
  },
  clearWishlist: async (): Promise<Partial<Wishlist>> => {
    const { data } = await api.put(`${RESOURCE_PREFIX}/clear`);
    return data;
  },
};
