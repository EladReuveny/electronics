import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../../features/auth/auth.types";

type AuthState = {
  user: AuthUser | null;
};

type AuthActions = {
  login: (authResponse: AuthUser) => void;
  logout: () => void;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (authUser: AuthUser) =>
        set({
          user: authUser,
        }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
