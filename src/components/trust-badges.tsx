import { Link } from "@tanstack/react-router";
import { ShieldCheck, BadgeCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const BADGES = [
  { icon: ShieldCheck, label: "Verified Professionals", sub: "CNIC + photo checked" },
  { icon: BadgeCheck, label: "Upfront Pricing", sub: "No hidden charges" },
  { icon: Sparkles, label: "Satisfaction Guarantee", sub: "Or we make it right" },
] as const;

interface Props {
  variant?: "compact" | "full";
  className?: string;
}

export function TrustBadges({ variant = "full", className }: Props) {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {BADGES.map((b) => (
          <Link
            key={b.label}
            to="/about"
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
          >
            <b.icon className="h-3.5 w-3.5 text-primary" />
            {b.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
      {BADGES.map((b) => (
        <Link
          key={b.label}
          to="/about"
          className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition hover:border-primary hover:shadow-sm"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <b.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{b.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{b.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
