import type { Category, ProductQueryDto } from "./product.types";

export const productsKeys = {
  all: ["products"],
  count: () => [...productsKeys.all, "count"],
  detail: (productId: string) => [...productsKeys.all, productId],
  search: (query?: string | ProductQueryDto) => [
    ...productsKeys.all,
    "search",
    typeof query === "object" ? query : { q: query },
  ],
  category: (category: Category) => [...productsKeys.all, category],
} as const;
