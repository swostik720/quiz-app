"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
};

type NavSection = {
  key: "user" | "quiz" | "management";
  title: string;
  items: NavItem[];
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<NavSection["key"], boolean>>({
    user: true,
    quiz: true,
    management: true,
  });

  const role = data?.user?.role ?? "user";

  const userItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  const quizItems: NavItem[] = [
    { href: "/quiz", label: "Play Quiz" },
    { href: "/results", label: "Results" },
  ];

  const managementItems: NavItem[] = [
    { href: "/admin", label: "User" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/questions", label: "Questions" },
    { href: "/admin/analytics", label: "Analytics" },
  ];

  const sections: NavSection[] = [
    { key: "user", title: "User", items: userItems },
    { key: "quiz", title: "Quiz", items: quizItems },
    ...(role === "admin"
      ? [{ key: "management", title: "Management", items: managementItems } as NavSection]
      : []),
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar userName={data?.user?.name} role={role} />
      <div className="container mx-auto space-y-3 p-4 md:grid md:grid-cols-[240px_1fr] md:gap-4 md:space-y-0">
        <div className="md:hidden">
          <Button variant="outline" onClick={() => setMobileOpen((prev) => !prev)}>
            {mobileOpen ? "Hide Menu" : "Show Menu"}
          </Button>
        </div>

        <aside
          className={cn(
            "rounded-xl border bg-card p-3 md:sticky md:top-4 md:h-fit",
            mobileOpen ? "block" : "hidden md:block"
          )}
        >
          <p className="px-2 pb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Navigation</p>
          <nav className="space-y-3">
            {sections.map((section) => (
              <div key={section.key} className="space-y-1">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [section.key]: !prev[section.key],
                    }))
                  }
                >
                  <span>{section.title}</span>
                  <span>{expanded[section.key] ? "↑" : "↓"}</span>
                </button>

                {expanded[section.key] && (
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm transition-colors",
                            isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <section className="space-y-4">{children}</section>
      </div>
    </div>
  );
}
