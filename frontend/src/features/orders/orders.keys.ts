export const ordersKeys = {
  all: ["orders"],
  count: () => [...ordersKeys.all, "count"],
  byUserId: (userId: string) => [...ordersKeys.all, "users", userId],
  asXML: () => [...ordersKeys.all, "xml-format"],
} as const;
