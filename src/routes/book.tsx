import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrustBadges } from "@/components/trust-badges";
import { Spinner, PageLoading } from "@/components/spinner";
import { notifyError } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

type Search = { service?: string };

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a service — HomeFix" },
      { name: "description", content: "Book an electrician or AC repair in Islamabad or Rawalpindi." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    service: typeof s.service === "string" ? s.service : undefined,
  }),
  component: BookPage,
});

const schema = z.object({
  service_slug: z.string().min(1, "Pick a service"),
  booking_date: z.date({ required_error: "Pick a date" }),
  booking_time: z.string().min(1, "Pick a time"),
  address: z.string().trim().min(10, "Full address (min 10 chars)").max(500),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone"),
  customer_name: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(500).optional(),
  payment_method: z.enum(["cash", "jazzcash", "easypaisa"]),
});

function BookPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [date, setDate] = useState<Date | undefined>();
  const [service, setService] = useState<string>(search.service ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "jazzcash" | "easypaisa">("cash");
  const [submitting, setSubmitting] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (error) throw error;
      return data as Tables<"services">[];
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, loading, navigate]);

  const selectedSvc = services.find((s) => s.slug === service);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);

    const parsed = schema.safeParse({
      service_slug: service,
      booking_date: date,
      booking_time: fd.get("time"),
      address: fd.get("address"),
      phone: fd.get("phone"),
      customer_name: fd.get("name"),
      notes: fd.get("notes") || undefined,
      payment_method: paymentMethod,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    if (parsed.data.payment_method !== "cash") {
      toast.error("That payment method is coming soon — please pick Cash on Service.");
      return;
    }

    const svc = services.find((s) => s.slug === parsed.data.service_slug);
    if (!svc) {
      toast.error("Service not found");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_slug: svc.slug,
      service_name: svc.name,
      price: svc.price,
      booking_date: format(parsed.data.booking_date, "yyyy-MM-dd"),
      booking_time: parsed.data.booking_time,
      address: parsed.data.address,
      phone: parsed.data.phone,
      customer_name: parsed.data.customer_name,
      notes: parsed.data.notes ?? null,
      payment_method: parsed.data.payment_method,
    });
    setSubmitting(false);

    if (error) {
      notifyError(error, "Couldn't save your booking. Please try again.");
      return;
    }
    toast.success("Booking confirmed! We'll contact you shortly.");
    navigate({ to: "/my-bookings" });
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <TrustBadges variant="compact" className="mb-4 justify-center" />
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Book a service</CardTitle>
              <CardDescription>
                Fill in the details and we'll dispatch a vetted technician.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.slug}>
                          {s.name} — {s.currency} {Number(s.price).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSvc && (
                    <p className="text-xs text-muted-foreground">
                      Fixed price: <span className="font-semibold text-foreground">{selectedSvc.currency} {Number(selectedSvc.price).toLocaleString()}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto p-3"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" name="time" type="time" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" name="name" required maxLength={100} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="03XX XXXXXXX" required maxLength={20} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" placeholder="House #, Street, Sector, City" required maxLength={500} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" name="notes" placeholder="Anything we should know?" maxLength={500} rows={2} />
                </div>

                <div className="space-y-2">
                  <Label>Payment method</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {([
                      { id: "cash", title: "Cash on Service", subtitle: "Pay the technician after the job.", disabled: false },
                      { id: "jazzcash", title: "JazzCash", subtitle: "Mobile wallet", disabled: true },
                      { id: "easypaisa", title: "easypaisa", subtitle: "Mobile wallet", disabled: true },
                    ] as const).map((opt) => {
                      const selected = paymentMethod === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={opt.disabled}
                          onClick={() => !opt.disabled && setPaymentMethod(opt.id)}
                          className={cn(
                            "rounded-lg border-2 p-3 text-left transition",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                            opt.disabled && "cursor-not-allowed opacity-60 hover:border-border",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{opt.title}</span>
                            {opt.disabled && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Coming soon
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{opt.subtitle}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (<><Spinner className="mr-2" /> Submitting…</>) : "Confirm booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
