"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ToasterProvider } from "@/components/ui/toaster";

const client = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ToasterProvider>
                <QueryClientProvider client={client}>
                    {children}
                </QueryClientProvider>
            </ToasterProvider>
        </SessionProvider>
    );
}