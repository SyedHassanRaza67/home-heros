import { Check, X } from "lucide-react";
import type { Enums } from "@/integrations/supabase/types";

type BookingStatus = Enums<"booking_status">;

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Accepted" },
  { key: "in_progress", label: "On the Way" },
  { key: "completed", label: "Completed" },
];

// statuses that count as "reached" each step
const ORDER: BookingStatus[] = ["pending", "confirmed", "in_progress", "completed"];

export function BookingProgress({ status }: { status: BookingStatus }) {
  if (status === "cancelled" || status === "rejected_by_provider") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <X className="h-4 w-4" />
        {status === "cancelled" ? "Booking cancelled" : "Provider declined this booking"}
      </div>
    );
  }

  // 'assigned' sits between pending and confirmed — treat as still pending in the bar
  const effective: BookingStatus = status === "assigned" ? "pending" : status;
  const currentIdx = ORDER.indexOf(effective);

  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const reached = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center gap-1.5">
              <div
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-muted text-muted-foreground",
                  isCurrent && status !== "completed" ? "ring-2 ring-primary/30" : "",
                ].join(" ")}
              >
                {reached && i < currentIdx ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    "h-0.5 flex-1 rounded transition-colors",
                    i < currentIdx ? "bg-primary" : "bg-muted-foreground/20",
                  ].join(" ")}
                />
              )}
            </div>
            <span
              className={[
                "w-full text-center text-[10px] leading-tight",
                reached ? "font-medium text-foreground" : "text-muted-foreground",
              ].join(" ")}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
