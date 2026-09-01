export const cartsKeys = {
  all: ["carts"],
  byUserId: (userId: string) => [...cartsKeys.all, "users", userId],
} as const;
