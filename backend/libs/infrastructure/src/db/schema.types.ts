import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export type Db = NodePgDatabase<typeof schema.relations>;

export type Role = (typeof schema.roleEnum.enumValues)[number]; // typeof schema.users.$inferSelect.role

export type Category = (typeof schema.categoryEnum.enumValues)[number]; // typeof schema.products.$inferSelect.category

export type OrderStatus = (typeof schema.orderStatusEnum.enumValues)[number]; // typeof schema.orders.$inferSelect.status

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

export type Product = typeof schema.products.$inferSelect;
export type NewProduct = typeof schema.products.$inferInsert;

export type Item = typeof schema.items.$inferSelect;
export type NewItem = typeof schema.items.$inferInsert;

export type Order = typeof schema.orders.$inferSelect;
export type NewOrder = typeof schema.orders.$inferInsert;

export type cart = typeof schema.carts.$inferSelect;
export type NewCart = typeof schema.carts.$inferInsert;

export type Wishlist = typeof schema.wishlists.$inferSelect;
export type NewWishlist = typeof schema.wishlists.$inferInsert;
