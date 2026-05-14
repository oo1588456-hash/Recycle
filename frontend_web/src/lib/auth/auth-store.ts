"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/lib/types";

export const dashboardPath = (role: UserRole) => {
  if (role === "superadmin") return "/admin/dashboard";
  if (role === "seller") return "/seller/dashboard";
  return "/buyer/dashboard";
};

type AuthState = {
  access: string | null;
  refresh: string | null;
  user: User | null;
  setSession: (access: string, refresh: string, user: User) => void;
  setUser: (user: User) => void;
  setAccess: (access: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      user: null,
      setSession: (access, refresh, user) => set({ access, refresh, user }),
      setUser: (user) => set({ user }),
      setAccess: (access) => set({ access }),
      logout: () => set({ access: null, refresh: null, user: null }),
    }),
    { name: "recycle-web-auth" }
  )
);
