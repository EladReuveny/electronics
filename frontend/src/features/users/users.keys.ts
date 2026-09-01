export const usersKeys = {
  all: ["users"],
  count: () => [...usersKeys.all, "count"],
  detail: (userId: string) => [...usersKeys.all, userId],
} as const;
