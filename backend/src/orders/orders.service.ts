import { DB_CLIENT } from '@app/infrastructure/db/db.constants';
import { carts, items, orders, products } from '@app/infrastructure/db/schema';
import type { Db } from '@app/infrastructure/db/schema.types';
import { NotificationsService } from '@app/infrastructure/notifications/notifications.service';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { count, eq, sql } from 'drizzle-orm';
import XMLBuilder from 'fast-xml-builder';
import { Logger } from 'pino-nestjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  private readonly CANCELLATION_TIMELINE_IN_DAYS = 7;

  constructor(
    @Inject(DB_CLIENT) private readonly db: Db,
    private readonly logger: Logger,
    private readonly notificationsService: NotificationsService,
  ) {}

  async checkout(userId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.db.query.carts.findFirst({
      where: {
        userId,
      },
      with: { items: { with: { product: true } } },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user with id ${userId}`);
    }

    if (cart.items.length === 0) {
      throw new BadRequestException(
        'Cart is empty. Add products to cart first',
      );
    }

    for (const item of cart.items) {
      if (!item.product || item.product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Product ${item.product?.name} is out of stock. Only ${item.product?.stockQuantity} available in stock`,
        );
      }
    }

    const totalCost = cart.items.reduce((acc, item) => {
      return acc + (item.product?.price ?? 0) * item.quantity;
    }, 0);

    const order = await this.db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          totalCost,
          shippingAddress: createOrderDto.shippingAddress,
          userId,
        })
        .returning({ id: orders.id });

      for (const item of cart.items) {
        await tx
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));

        await tx
          .update(items)
          .set({ cartId: null, orderId: order.id })
          .where(eq(items.id, item.id));
      }

      await tx.update(carts).set({ totalCost: 0 }).where(eq(carts.id, cart.id));

      return order;
    });

    try {
      const user = await this.db.query.users.findFirst({
        where: {
          id: userId,
        },
        columns: {
          email: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User not found for user with id ${userId}`,
        );
      }

      await this.notificationsService.sendOrderConfirmationEmail(
        user.email,
        order.id,
      );
    } catch (err: unknown) {
      this.logger.error(
        `Failed to send order confirmation email for order with id ${order.id}: ${err}`,
      );
    }

    return this.db.query.orders.findFirst({
      where: {
        id: order.id,
      },
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.db.query.orders.findMany();
  }

  async findAllAsXML() {
    const orders = await this.db.query.orders.findMany({
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });
    const builder = new XMLBuilder({
      format: true,
    });
    const xml = builder.build({
      orders: {
        order: orders,
      },
    });

    return xml;
  }

  async findOne(orderId: string) {
    const order = await this.db.query.orders.findFirst({
      where: {
        id: orderId,
      },
      with: { items: { with: { product: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return order;
  }

  async update(orderId: string, updateOrderDto: UpdateOrderDto) {
    await this.db
      .update(orders)
      .set(updateOrderDto)
      .where(eq(orders.id, orderId));

    return this.db.query.orders.findFirst({
      where: {
        id: orderId,
      },
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  async remove(orderId: string) {
    await this.db.delete(orders).where(eq(orders.id, orderId));
  }

  async findUserOrders(userId: string) {
    return this.db.query.orders.findMany({
      where: {
        userId,
      },
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  async cancelOrder(
    userId: string,
    orderId: string,
  ): Promise<{ status: HttpStatus; message: string }> {
    const order = await this.db.query.orders.findFirst({
      where: {
        id: orderId,
        userId,
      },
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with id ${orderId} not found for user with id ${userId}`,
      );
    }

    if (order.status === 'CANCELED') {
      throw new BadRequestException(
        `Order with id ${orderId} has already been cancelled`,
      );
    }

    if (order.status === 'DELIVERED') {
      throw new BadRequestException(
        `Order with id ${orderId} cannot be cancelled as it has already been delivered`,
      );
    }

    const isOrderCancellationExpired =
      order.createdAt.getTime() +
        this.CANCELLATION_TIMELINE_IN_DAYS * 24 * 60 * 60 * 1000 <
      new Date().getTime();
    if (isOrderCancellationExpired) {
      throw new BadRequestException(
        `Order can be cancelled only within ${this.CANCELLATION_TIMELINE_IN_DAYS} days start from the order date.`,
      );
    }

    return await this.db.transaction(async (tx) => {
      for (const item of order.items) {
        await tx
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }

      await tx
        .update(orders)
        .set({
          status: 'CANCELED',
        })
        .where(eq(orders.id, orderId));

      return {
        status: HttpStatus.OK,
        message: 'Order cancelled successfully',
      };
    });
  }

  async findOrdersCount() {
    const [result] = await this.db
      .select({ ordersCount: count() })
      .from(orders);

    return result;
  }
}
