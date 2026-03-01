"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAdminUsers, type AdminUser, updateUserRole } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminUsersTable() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const result = await getAdminUsers();
      return result.users;
    },
  });

  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  async function onRoleChange(userId: string, role: "user" | "admin") {
    roleMutation.mutate({ userId, role });
  }

  if (usersQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading users...</p>;
  }

  const users = (usersQuery.data ?? []) as AdminUser[];
  const isSaving = roleMutation.isPending;
  const apiError = usersQuery.error ?? roleMutation.error;

  return (
    <div className="space-y-3">
      {apiError && <p className="text-sm text-destructive">{getApiErrorMessage(apiError, "Request failed")}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-2">
                  <Button
                    size="sm"
                    variant={user.role === "admin" ? "secondary" : "outline"}
                    disabled={isSaving || user.role === "admin"}
                    onClick={() => onRoleChange(user.id, "admin")}
                  >
                    Make Admin
                  </Button>
                  <Button
                    size="sm"
                    variant={user.role === "user" ? "secondary" : "outline"}
                    disabled={isSaving || user.role === "user"}
                    onClick={() => onRoleChange(user.id, "user")}
                  >
                    Make User
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
