import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  token: string | null;
  hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  isDoctor: () => boolean;
  isPatient: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hasHydrated: false,

      setAuth: (user, token) => {
        const currentUser = get().user;
        if (currentUser && currentUser.id !== user.id) {
          localStorage.removeItem("mindtrack-chat-store");
          localStorage.removeItem("mindtrack-mood-store");
        }
        set({ user, token });
        localStorage.setItem("token", token);
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem("token");
        localStorage.removeItem("mindtrack-chat-store");
        localStorage.removeItem("mindtrack-mood-store");
      },

      setHasHydrated: (state) => set({ hasHydrated: state }),

      isDoctor: () => {
        const user = get().user;
        return user?.role === "doctor" || user?.role === "admin";
      },

      isPatient: () => {
        const user = get().user;
        return !user?.role || user.role === "patient";
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);