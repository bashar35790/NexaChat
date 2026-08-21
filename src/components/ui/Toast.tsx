"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used within <ToastProvider>");
  return api;
}

const AUTO_DISMISS_MS = 4000;

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="size-5 text-success" aria-hidden="true" />,
  error: <XCircle className="size-5 text-danger" aria-hidden="true" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (kind: ToastKind) => (message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ success: push("success"), error: push("error") }),
    [push],
  );

  // SSR-safe gate for portal rendering.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted
        ? createPortal(
            <div
              role="region"
              aria-label="Notifications"
              aria-live="polite"
              className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4"
            >
              <AnimatePresence>
                {toasts.map((toast) => (
                  <motion.div
                    key={toast.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={cn(
                      "pointer-events-auto flex w-full items-center gap-3 rounded-xl bg-overlay px-4 py-3",
                      "shadow-pop ring-1 ring-line-strong",
                    )}
                  >
                    {ICONS[toast.kind]}
                    <p className="flex-1 text-sm text-fg">{toast.message}</p>
                    <button
                      type="button"
                      onClick={() => dismiss(toast.id)}
                      aria-label="Dismiss notification"
                      className="rounded-full p-1 text-faint transition-colors hover:bg-raised hover:text-fg"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}
