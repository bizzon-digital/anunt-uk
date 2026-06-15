"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export function showToast(type: ToastType, title: string, message?: string) {
  if (typeof window !== "undefined") {
    (window as any).__toast?.(type, title, message);
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  useEffect(() => {
    (window as any).__toast = toast;
  }, [toast]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />,
    error: <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />,
    info: <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />,
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "bg-white border rounded-xl shadow-lg p-4 flex items-start gap-3 pointer-events-auto",
            t.type === "success" && "border-green-100",
            t.type === "error" && "border-red-100",
            t.type === "info" && "border-blue-100"
          )}
        >
          {icons[t.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{t.title}</p>
            {t.message && (
              <p className="text-xs text-gray-500 mt-0.5">{t.message}</p>
            )}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}