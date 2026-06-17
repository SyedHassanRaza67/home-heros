import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
import { StarRating, RatingSummary } from "@/components/star-rating";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({ meta: [{ title: "My bookings — HomeFix" }] }),
  component: MyBookings,
});

function MyBookings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"bookings">[];
    },
  });

  const providerIds = Array.from(new Set(bookings.map((b) => b.provider_id).filter(Boolean) as string[]));

  const { data: providers = [] } = useQuery({
    queryKey: ["bookings-providers", providerIds.join(",")],
    enabled: providerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("id, full_name, phone, service_slug")
        .in("id", providerIds);
      if (error) throw error;
      return data as { id: string; full_name: string; phone: string; service_slug: string }[];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["my-reviews", user?.id, providerIds.join(",")],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("provider_id, rating, booking_id");
      if (error) throw error;
      return data as { provider_id: string; rating: number; booking_id: string }[];
    },
  });

  const reviewByBooking = new Map(reviews.map((r) => [r.booking_id, r]));
  const ratingByProvider = reviews.reduce<Record<string, { sum: number; count: number }>>((acc, r) => {
    const e = acc[r.provider_id] ?? { sum: 0, count: 0 };
    e.sum += r.rating; e.count += 1;
    acc[r.provider_id] = e;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">My bookings</h1>
              <p className="text-sm text-muted-foreground">All your service requests.</p>
            </div>
            <Button asChild><Link to="/book">New booking</Link></Button>
          </div>

          {isLoading && <p className="text-muted-foreground">Loading…</p>}

          {!isLoading && bookings.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center">
                <p className="text-muted-foreground">You haven't booked anything yet.</p>
                <Button className="mt-4" asChild><Link to="/book">Book your first service</Link></Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {bookings.map((b) => {
              const provider = providers.find((p) => p.id === b.provider_id);
              const r = provider ? ratingByProvider[provider.id] : undefined;
              const myReview = reviewByBooking.get(b.id);
              return (
                <Card key={b.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{b.service_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(b.booking_date), "PPP")} at {b.booking_time.slice(0, 5)}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={b.status} />
                        <p className="mt-1 text-sm font-semibold">PKR {Number(b.price).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 border-t pt-3 text-sm">
                      <p><span className="text-muted-foreground">Address:</span> {b.address}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {b.phone}</p>
                      {b.notes && <p><span className="text-muted-foreground">Notes:</span> {b.notes}</p>}
                      {provider && (
                        <p className="flex items-center gap-2">
                          <span className="text-muted-foreground">Provider:</span>
                          <span>{provider.full_name} ({provider.phone})</span>
                          <RatingSummary avg={r ? r.sum / r.count : 0} count={r?.count ?? 0} />
                        </p>
                      )}
                    </div>

                    {b.status === "completed" && provider && (
                      <div className="mt-3 border-t pt-3">
                        {myReview ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Your rating:</span>
                            <StarRating value={myReview.rating} />
                          </div>
                        ) : (
                          <ReviewDialog
                            bookingId={b.id}
                            providerId={provider.id}
                            providerName={provider.full_name}
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ReviewDialog({ bookingId, providerId, providerName }: { bookingId: string; providerId: string; providerName: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!user) return;
    if (rating < 1 || rating > 5) return toast.error("Pick a rating 1–5");
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      provider_id: providerId,
      customer_id: user.id,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks for your review!");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["my-reviews"] });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Leave a review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {providerName}</DialogTitle>
          <DialogDescription>Help others by sharing your experience.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <StarRating value={rating} onChange={setRating} size={28} />
          <Textarea
            placeholder="Optional comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit review"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
