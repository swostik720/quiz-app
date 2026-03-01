import { apiClient } from "@/lib/api/client";
import type { AdminUpdateRoleInput } from "@/lib/validations/auth";

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  createdAt?: string;
};

export async function getAdminUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data as { users: AdminUser[] };
}

export async function updateUserRole(payload: AdminUpdateRoleInput) {
  const { data } = await apiClient.patch("/admin/users", payload);
  return data as { message: string; user: AdminUser };
}
