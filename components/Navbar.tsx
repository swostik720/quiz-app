"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  userName?: string | null;
  role?: "user" | "admin";
};

export default function Navbar({ userName, role = "user" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const initials = (userName ?? "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join("");

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Quiz Hub</h1>
            <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(true)}>
              Logout
            </Button>

            <div className="relative">
              <Button variant="outline" className="gap-2" onClick={() => setOpen(!open)}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials || "U"}
                </span>
                <span className="hidden sm:inline">{userName ?? "User"}</span>
              </Button>

              {open && (
                <div className="absolute right-0 top-11 z-20 min-w-40 rounded-md border bg-popover p-2 shadow-sm">
                  <Link href="/dashboard" className="block rounded px-2 py-1 text-sm hover:bg-accent" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>

                  <Link href="/profile" className="block rounded px-2 py-1 text-sm hover:bg-accent" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Logout now?"
        description="Are you sure you want to logout from this account?"
        confirmLabel="Logout"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => signOut({ callbackUrl: "/login?loggedOut=1" })}
      />
    </>
  );
}