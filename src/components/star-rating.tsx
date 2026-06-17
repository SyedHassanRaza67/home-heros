import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = 18,
  className,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  className?: string;
}) {
  const interactive = !!onChange;
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const Btn = interactive ? "button" : "span";
        return (
          <Btn
            key={n}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(n) : undefined}
            className={cn(
              "inline-flex",
              interactive && "p-1 hover:scale-110 transition",
            )}
            aria-label={interactive ? `Rate ${n} star${n > 1 ? "s" : ""}` : undefined}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                filled ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground",
              )}
            />
          </Btn>
        );
      })}
    </div>
  );
}

export function RatingSummary({ avg, count, size = 16 }: { avg: number; count: number; size?: number }) {
  if (!count) {
    return <span className="text-xs text-muted-foreground">No reviews yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star style={{ width: size, height: size }} className="fill-yellow-400 text-yellow-400" />
      <span className="font-semibold">{avg.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </span>
  );
}
