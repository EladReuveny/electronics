CREATE TYPE "category" AS ENUM('SMART_PHONE', 'TABLET', 'LAPTOP', 'TV');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('PENDING', 'PACKAGING', 'DELIVERED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"total_amount" numeric(10,2) DEFAULT '0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"productId" uuid NOT NULL,
	"cartId" uuid,
	"orderId" uuid,
	CONSTRAINT "items_cart_id_product_id_unique" UNIQUE("cartId","productId")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"total_amount" numeric(10,2) NOT NULL,
	"status" "order_status" DEFAULT 'PENDING'::"order_status" NOT NULL,
	"shippingAddress" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10,2) NOT NULL,
	"imageUrl" text NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"category" "category" DEFAULT 'SMART_PHONE'::"category" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL UNIQUE,
	"password" text NOT NULL,
	"address" text,
	"phone" varchar(20),
	"role" "role" DEFAULT 'USER'::"role" NOT NULL,
	"avatarUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "wishlists_products" (
	"wishlistId" uuid,
	"productId" uuid,
	CONSTRAINT "wishlists_products_pkey" PRIMARY KEY("wishlistId","productId")
);
--> statement-breakpoint
CREATE INDEX "carts_total_amount_idx" ON "carts" ("total_amount");--> statement-breakpoint
CREATE INDEX "carts_user_id_idx" ON "carts" ("userId");--> statement-breakpoint
CREATE INDEX "items_product_id_idx" ON "items" ("productId");--> statement-breakpoint
CREATE INDEX "items_order_id_idx" ON "items" ("orderId");--> statement-breakpoint
CREATE INDEX "orders_total_amount_idx" ON "orders" ("total_amount");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" ("status");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" ("userId");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" ("createdAt");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" ("name");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" ("category");--> statement-breakpoint
CREATE INDEX "users_address_idx" ON "users" ("address");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" ("phone");--> statement-breakpoint
CREATE INDEX "wishlists_products_product_id_idx" ON "wishlists_products" ("productId");--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_productId_products_id_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_cartId_carts_id_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_orderId_orders_id_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "wishlists_products" ADD CONSTRAINT "wishlists_products_wishlistId_wishlists_id_fkey" FOREIGN KEY ("wishlistId") REFERENCES "wishlists"("id");--> statement-breakpoint
ALTER TABLE "wishlists_products" ADD CONSTRAINT "wishlists_products_productId_products_id_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id");