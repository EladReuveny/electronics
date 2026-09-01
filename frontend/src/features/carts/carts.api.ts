import { api } from "../../lib/api/api.config";
import type { AddProductToCartDto, Cart, UpdateCartDto } from "./cart.types";

const RESOURCE_PREFIX = "carts";

export const cartsApi = {
  findAll: async (): Promise<Cart[]> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}`);
    return data;
  },
  findOne: async (cartId: string): Promise<Cart> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/${cartId}`);
    return data;
  },
  update: async (
    cartId: string,
    updateCartDto: UpdateCartDto,
  ): Promise<Cart> => {
    const { data } = await api.patch(
      `${RESOURCE_PREFIX}/${cartId}`,
      updateCartDto,
    );
    return data;
  },
  addProductToCart: async (
    productId: string,
    addProductToCartDto: AddProductToCartDto,
  ): Promise<Cart> => {
    const { data } = await api.post(
      `${RESOURCE_PREFIX}/products/${productId}`,
      addProductToCartDto,
    );
    return data;
  },
  removeProductFromCart: async (productId: string): Promise<Cart> => {
    const { data } = await api.delete(
      `${RESOURCE_PREFIX}/products/${productId}`,
    );
    return data;
  },
  clearCart: async (): Promise<Partial<Cart>> => {
    const { data } = await api.put(`${RESOURCE_PREFIX}/clear`);
    return data;
  },
};
