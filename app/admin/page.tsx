import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

import AdminUsersTable from "./admin-users-table";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage users in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full">Categories</Button>
              </Link>
              <Link href="/admin/questions">
                <Button variant="outline" className="w-full">Questions</Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full">Analytics</Button>
              </Link>
            </div> */}
            <AdminUsersTable />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
