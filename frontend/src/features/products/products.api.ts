import { api } from "../../lib/api/api.config";
import type {
  CreateProductDto,
  Product,
  ProductQueryDto,
  UpdateProductDto,
} from "./product.types";

const RESOURCE_PREFIX = "products";

export const productsApi = {
  create: async (createProductDto: CreateProductDto): Promise<Product> => {
    const { data } = await api.post(`${RESOURCE_PREFIX}`, createProductDto);
    return data;
  },
  findAll: async (): Promise<Product[]> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}`);
    return data;
  },
  findProductsByQuery: async (query: ProductQueryDto): Promise<Product[]> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/search`, {
      params: query,
    });
    return data;
  },
  findOne: async (productId: string): Promise<Product> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/${productId}`);
    return data;
  },
  update: async (
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> => {
    const { data } = await api.patch(
      `${RESOURCE_PREFIX}/${productId}`,
      updateProductDto,
    );
    return data;
  },
  remove: async (productId: string): Promise<void> => {
    await api.delete(`${RESOURCE_PREFIX}/${productId}`);
  },
  removeSelectedProducts: async (productsIds: string[]): Promise<void> => {
    await api.put(`${RESOURCE_PREFIX}/remove-selected-products`, productsIds);
  },
  findProductsAndCategoriesCount: async (): Promise<{
    productsCount: number;
    categoriesCount: number;
  }> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/count`);
    return data;
  },
};
