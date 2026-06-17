import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function normalize(phone: string | null | undefined) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Pakistan: convert leading 0 to country code 92
  if (digits.startsWith("0")) digits = "92" + digits.slice(1);
  return digits;
}

interface Props {
  phone: string | null | undefined;
  label?: string;
  message?: string;
  className?: string;
  size?: "sm" | "default";
}

export function WhatsAppButton({ phone, label = "WhatsApp", message, className, size = "sm" }: Props) {
  const digits = normalize(phone);
  if (!digits) return null;
  const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  return (
    <Button asChild size={size} variant="outline" className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-1.5 h-4 w-4 text-success" />
        {label}
      </a>
    </Button>
  );
}
