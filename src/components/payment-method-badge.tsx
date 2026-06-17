import { Badge } from "@/components/ui/badge";
import { Banknote, Smartphone } from "lucide-react";
import type { Enums } from "@/integrations/supabase/types";

export type PaymentMethod = Enums<"payment_method">;

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash on Service",
  jazzcash: "JazzCash",
  easypaisa: "easypaisa",
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const Icon = method === "cash" ? Banknote : Smartphone;
  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="h-3 w-3" />
      {PAYMENT_LABELS[method]}
    </Badge>
  );
}
