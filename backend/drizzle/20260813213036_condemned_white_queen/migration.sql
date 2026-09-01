ALTER TABLE "carts" RENAME COLUMN "total_amount" TO "total_cost";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "total_amount" TO "total_cost";--> statement-breakpoint
ALTER INDEX "carts_total_amount_idx" RENAME TO "carts_total_cost_idx";--> statement-breakpoint
ALTER INDEX "orders_total_amount_idx" RENAME TO "orders_total_cost_idx";