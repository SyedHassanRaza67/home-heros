import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/integrations/supabase/types";
type BookingStatus = Enums<"booking_status">;

const styles: Record<BookingStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/30",
  assigned: "bg-accent/30 text-accent-foreground border-accent/40",
  confirmed: "bg-primary/15 text-primary border-primary/30",
  in_progress: "bg-accent/30 text-accent-foreground border-accent/40",
  completed: "bg-success/20 text-success-foreground border-success/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  rejected_by_provider: "bg-destructive/15 text-destructive border-destructive/30",
};

const labels: Record<BookingStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  confirmed: "Accepted",
  in_progress: "On the Way",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected_by_provider: "Provider declined",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}
