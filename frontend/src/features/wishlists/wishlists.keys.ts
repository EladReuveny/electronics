export const wishlistsKeys = {
  all: ["wishlists"],
  byUserId: (userId: string) => [...wishlistsKeys.all, "users", userId],
} as const;
