import { defineRelations } from 'drizzle-orm';
import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

export const categoryEnum = pgEnum('category', [
  'SMART_PHONE',
  'TABLET',
  'LAPTOP',
  'TV',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'PACKAGING',
  'DELIVERED',
  'CANCELED',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    address: text('address'),
    phone: varchar('phone', { length: 20 }),
    role: roleEnum('role').notNull().default('USER'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('users_address_idx').on(t.address),
    index('users_phone_idx').on(t.phone),
  ],
);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    price: numeric('price', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
    imageUrl: text('image_url').notNull(),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    category: categoryEnum('category').notNull().default('SMART_PHONE'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('products_name_idx').on(t.name),
    index('products_category_idx').on(t.category),
  ],
);

export const items = pgTable(
  'items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    cartId: uuid('cart_id').references(() => carts.id, {
      onDelete: 'cascade',
    }),
    orderId: uuid('order_id').references(() => orders.id, {
      onDelete: 'cascade',
    }),
  },
  (t) => [
    index('items_product_id_idx').on(t.productId),
    index('items_order_id_idx').on(t.orderId),
    unique('items_cart_id_product_id_unique').on(t.cartId, t.productId),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    totalCost: numeric('total_cost', {
      precision: 10,
      scale: 2,
      mode: 'number',
    }).notNull(),
    status: orderStatusEnum('status').notNull().default('PENDING'),
    shippingAddress: text('shipping_address').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
  },
  (t) => [
    index('orders_total_cost_idx').on(t.totalCost),
    index('orders_status_idx').on(t.status),
    index('orders_created_at_idx').on(t.createdAt),
    index('orders_user_id_idx').on(t.userId),
  ],
);

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    totalCost: numeric('total_cost', {
      precision: 10,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [
    index('carts_total_cost_idx').on(t.totalCost),
    index('carts_user_id_idx').on(t.userId),
  ],
);

export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const wishlistsProducts = pgTable(
  'wishlists_products',
  {
    wishlistId: uuid('wishlist_id')
      .notNull()
      .references(() => wishlists.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
  },
  (t) => [
    primaryKey({ columns: [t.wishlistId, t.productId] }),
    index('wishlists_products_product_id_idx').on(t.productId),
  ],
);

export const relations = defineRelations(
  {
    users,
    products,
    items,
    orders,
    carts,
    wishlists,
    wishlistsProducts,
  },
  (r) => ({
    users: {
      wishlist: r.one.wishlists({
        from: r.users.id,
        to: r.wishlists.userId,
      }),
      cart: r.one.carts({
        from: r.users.id,
        to: r.carts.userId,
      }),
      orders: r.many.orders(),
    },

    products: {
      items: r.many.items(),
      wishlists: r.many.wishlists(),
    },

    items: {
      product: r.one.products({
        from: r.items.productId,
        to: r.products.id,
      }),
      cart: r.one.carts({
        from: r.items.cartId,
        to: r.carts.id,
      }),
      order: r.one.orders({
        from: r.items.orderId,
        to: r.orders.id,
      }),
    },

    orders: {
      items: r.many.items(),
      user: r.one.users({
        from: r.orders.userId,
        to: r.users.id,
      }),
    },

    carts: {
      users: r.one.users({
        from: r.carts.userId,
        to: r.users.id,
      }),
      items: r.many.items(),
    },

    wishlists: {
      user: r.one.users({
        from: r.wishlists.userId,
        to: r.users.id,
      }),
      products: r.many.products({
        from: r.wishlists.id.through(r.wishlistsProducts.wishlistId),
        to: r.products.id.through(r.wishlistsProducts.productId),
      }),
    },
  }),
);
