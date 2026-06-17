import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/integrations/supabase/types";
type BookingStatus = Enums<"booking_status">;

const styles: Record<BookingStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/30",
  confirmed: "bg-primary/15 text-primary border-primary/30",
  in_progress: "bg-accent/30 text-accent-foreground border-accent/40",
  completed: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const labels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}
