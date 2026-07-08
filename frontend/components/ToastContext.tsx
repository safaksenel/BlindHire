"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div 
        aria-live="polite"
        role="status"
        className="fixed top-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-xl min-w-[280px] max-w-[90vw] ${
                toast.type === "success" 
                  ? "border-theme-1/30 bg-black/80 text-theme-1"
                  : toast.type === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-500"
                  : "border-white/10 bg-black/80 text-white/90"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {toast.type === "error" && <AlertTriangle className="h-4 w-4 shrink-0" />}
              {toast.type === "info" && <Info className="h-4 w-4 shrink-0" />}
              <span className="flex-1 truncate">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
