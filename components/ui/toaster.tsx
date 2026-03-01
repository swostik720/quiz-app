"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  pushToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-100 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-md border p-3 text-sm shadow-sm ${
              toast.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : toast.type === "error"
                  ? "border-red-300 bg-red-50 text-red-900"
                  : "border-border bg-card text-card-foreground"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useAppToast must be used inside ToasterProvider");
  }

  return context;
}
