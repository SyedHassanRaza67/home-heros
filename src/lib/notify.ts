import { toast } from "sonner";

/**
 * Show a friendly error toast and log the technical details for debugging.
 * Use this instead of `toast.error(err.message)` for user-facing failures.
 */
export function notifyError(err: unknown, fallback = "Something went wrong. Please try again.") {
  console.error(err);
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  // Hide raw DB/auth errors — only surface short, human messages
  const friendly = msg && msg.length < 80 && !/[{}\[\]]/.test(msg) ? msg : fallback;
  toast.error(friendly);
}
