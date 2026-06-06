import { create } from "zustand";
import type { IUser, UserRole } from "@/features/auth/types/IUser";
import { getMe, login, logout } from "@/features/auth/api/auth.service";

type AuthState = {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  loginUser: (email: string, password: string) => Promise<void>;
  loadUser: () => Promise<void>;
  logoutUser: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  loginUser: async (email, password) => {
    const user = await login({ email, password });

    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  loadUser: async () => {
    try {
      const user = await getMe();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logoutUser: async () => {
    await logout();

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;

    return user.roles.some((role) => roles.includes(role.rol_codigo));
  },
}));