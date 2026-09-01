import type { HttpStatusCode } from "axios";
import { api } from "../../lib/api/api.config";
import type { CreateOrderDto, Order, UpdateOrderDto } from "./order.types";

const RESOURCE_PREFIX = "orders";

export const ordersApi = {
  checkout: async (createOrderDto: CreateOrderDto): Promise<Order> => {
    const { data } = await api.post(`${RESOURCE_PREFIX}`, createOrderDto);
    return data;
  },
  findAll: async (): Promise<Order[]> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}`);
    return data;
  },
  findAllAsXML: async (): Promise<Order[]> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/xml-format`);
    return data;
  },
  findOne: async (orderId: string): Promise<Order> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/${orderId}`);
    return data;
  },
  update: async (
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> => {
    const { data } = await api.patch(
      `${RESOURCE_PREFIX}/${orderId}`,
      updateOrderDto,
    );
    return data;
  },
  remove: async (orderId: string): Promise<void> => {
    await api.delete(`${RESOURCE_PREFIX}/${orderId}`);
  },
  cancelOrder: async (
    orderId: string,
  ): Promise<{
    status: HttpStatusCode;
    message: string;
  }> => {
    const { data } = await api.patch(`${RESOURCE_PREFIX}/${orderId}/cancel`);
    return data;
  },
  findOrdersCount: async (): Promise<{ ordersCount: number }> => {
    const { data } = await api.get(`${RESOURCE_PREFIX}/count`);
    return data;
  },
};
