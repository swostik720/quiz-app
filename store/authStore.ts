import { create } from "zustand";

type AuthUser = {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: "user" | "admin";
};

type AuthNotice = {
    type: "success" | "error";
    text: string;
} | null;

interface AuthState {
    user: AuthUser | null;
    notice: AuthNotice;
    setUser: (user: AuthUser | null) => void;
    setNotice: (notice: AuthNotice) => void;
    clearNotice: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    notice: null,
    setUser: (user) => set({ user }),
    setNotice: (notice) => set({ notice }),
    clearNotice: () => set({ notice: null }),
}));