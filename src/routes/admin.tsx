import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { PaymentMethodBadge } from "@/components/payment-method-badge";
import { RatingSummary } from "@/components/star-rating";
import { BookingProgress } from "@/components/booking-progress";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Spinner, PageLoading } from "@/components/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { listUsers, sendPasswordReset } from "@/lib/admin.functions";
import type { Enums, Tables } from "@/integrations/supabase/types";
type BookingStatus = Enums<"booking_status">;

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin dashboard — Aram Karo" }] }),
  component: AdminPage,
});

const STATUSES: BookingStatus[] = [
  "pending", "confirmed", "in_progress", "completed", "cancelled", "assigned", "rejected_by_provider",
];

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth", replace: true });
    else if (!isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/", replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"bookings">[];
    },
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["admin-providers"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"providers">[];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("provider_id, rating");
      if (error) throw error;
      return data as { provider_id: string; rating: number }[];
    },
  });

  const ratingByProvider = reviews.reduce<Record<string, { sum: number; count: number }>>((acc, r) => {
    const e = acc[r.provider_id] ?? { sum: 0, count: 0 };
    e.sum += r.rating; e.count += 1;
    acc[r.provider_id] = e;
    return acc;
  }, {});

  async function updateStatus(id: string, status: BookingStatus) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  }

  async function assignProvider(bookingId: string, providerId: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ provider_id: providerId, status: "assigned" })
      .eq("id", bookingId);
    if (error) return toast.error(error.message);
    toast.success("Provider assigned");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  }

  async function setProviderStatus(p: Tables<"providers">, status: "approved" | "rejected") {
    const { error } = await supabase.from("providers").update({ status }).eq("id", p.id);
    if (error) return toast.error(error.message);

    if (status === "approved") {
      const { error: roleErr } = await supabase
        .from("user_roles")
        .insert({ user_id: p.user_id, role: "provider" });
      if (roleErr && !roleErr.message.includes("duplicate")) {
        toast.error(`Status set but role failed: ${roleErr.message}`);
      }
    } else {
      await supabase.from("user_roles").delete().eq("user_id", p.user_id).eq("role", "provider");
    }
    toast.success(`Provider ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-providers"] });
  }

  async function viewPhoto(path: string) {
    const { data, error } = await supabase.storage.from("provider-photos").createSignedUrl(path, 300);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }

  const counts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  if (loading || !user || !isAdmin) {
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
        <div className="container mx-auto px-4 py-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage bookings and providers.</p>
          </div>

          <Tabs defaultValue="bookings">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
                {STATUSES.map((s) => (
                  <Card key={s}>
                    <CardContent className="p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">{s.replace(/_/g, " ")}</p>
                      <p className="mt-1 text-2xl font-bold">{counts[s] ?? 0}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Spinner /> Loading bookings…
                </div>
              )}
              {!isLoading && bookings.length === 0 && (
                <Card><CardContent className="p-10 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
              )}

              {bookings.map((b) => {
                const availableProviders = providers.filter(
                  (p) => p.status === "approved" && p.is_available && p.service_slug === b.service_slug,
                );
                const assigned = providers.find((p) => p.id === b.provider_id);
                return (
                  <Card key={b.id}>
                    <CardContent className="p-5">
                      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{b.service_name}</h3>
                            <StatusBadge status={b.status} />
                            <PaymentMethodBadge method={b.payment_method} />
                          </div>
                          <div className="grid gap-1 text-sm md:grid-cols-2">
                            <p><span className="text-muted-foreground">Customer:</span> {b.customer_name ?? "—"}</p>
                            <p><span className="text-muted-foreground">Phone:</span> {b.phone}</p>
                            <p><span className="text-muted-foreground">When:</span> {format(new Date(b.booking_date), "PPP")} at {b.booking_time.slice(0, 5)}</p>
                            <p><span className="text-muted-foreground">Booked:</span> {format(new Date(b.created_at), "PP p")}</p>
                            <p className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {b.address}</p>
                            {b.notes && <p className="md:col-span-2"><span className="text-muted-foreground">Notes:</span> {b.notes}</p>}
                            <p className="md:col-span-2">
                              <span className="text-muted-foreground">Provider:</span>{" "}
                              {assigned ? `${assigned.full_name} (${assigned.phone})` : "Unassigned"}
                            </p>
                          </div>
                          {(() => {
                            const price = Number(b.price);
                            const rate = Number(b.commission_rate ?? 0.15);
                            const commission = price * rate;
                            const payout = price - commission;
                            return (
                              <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-3 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Service price</p>
                                  <p className="mt-0.5 text-sm font-semibold">PKR {price.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Commission ({Math.round(rate * 100)}%)</p>
                                  <p className="mt-0.5 text-sm font-semibold text-primary">PKR {commission.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Provider payout</p>
                                  <p className="mt-0.5 text-sm font-semibold">PKR {payout.toLocaleString()}</p>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="mt-2 rounded-lg border bg-background p-3">
                            <BookingProgress status={b.status} />
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <WhatsAppButton
                              phone={b.phone}
                              label={`Customer${b.customer_name ? ` (${b.customer_name.split(" ")[0]})` : ""}`}
                            />
                            {assigned && (
                              <WhatsAppButton
                                phone={assigned.phone}
                                label={`Provider (${assigned.full_name.split(" ")[0]})`}
                              />
                            )}
                          </div>
                        </div>
                        <div className="md:w-56 space-y-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                            <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as BookingStatus)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Assign provider</label>
                            <Select value={b.provider_id ?? ""} onValueChange={(v) => assignProvider(b.id, v)}>
                              <SelectTrigger><SelectValue placeholder="Pick available provider" /></SelectTrigger>
                              <SelectContent>
                                {availableProviders.length === 0 && (
                                  <div className="px-3 py-2 text-xs text-muted-foreground">No available providers</div>
                                )}
                                {availableProviders.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.full_name} — {p.city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {b.status !== "cancelled" && b.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-full"
                              onClick={() => updateStatus(b.id, "cancelled")}
                            >
                              Cancel booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="providers" className="pt-4 space-y-3">
              {providers.length === 0 && (
                <Card><CardContent className="p-10 text-center text-muted-foreground">No providers yet.</CardContent></Card>
              )}
              {providers.map((p) => {
                const r = ratingByProvider[p.id];
                const avg = r ? r.sum / r.count : 0;
                return (
                  <Card key={p.id}>
                    <CardContent className="p-5">
                      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{p.full_name}</h3>
                            <Badge variant="outline" className="capitalize">{p.status}</Badge>
                            {p.is_available && <Badge className="bg-success text-success-foreground">Available</Badge>}
                            <RatingSummary avg={avg} count={r?.count ?? 0} />
                          </div>
                          <div className="grid gap-1 text-sm md:grid-cols-2">
                            <p><span className="text-muted-foreground">Phone:</span> {p.phone}</p>
                            <p><span className="text-muted-foreground">Service:</span> {p.service_slug}</p>
                            <p><span className="text-muted-foreground">City:</span> {p.city}</p>
                            <p><span className="text-muted-foreground">CNIC:</span> {p.cnic}</p>
                            <p><span className="text-muted-foreground">Applied:</span> {format(new Date(p.created_at), "PP")}</p>
                          </div>
                        </div>
                        <div className="md:w-44 flex flex-col gap-2">
                          {p.photo_url && (
                            <Button size="sm" variant="outline" onClick={() => viewPhoto(p.photo_url!)}>View photo</Button>
                          )}
                          {p.status !== "approved" && (
                            <Button size="sm" onClick={() => setProviderStatus(p, "approved")}>Approve</Button>
                          )}
                          {p.status !== "rejected" && (
                            <Button size="sm" variant="destructive" onClick={() => setProviderStatus(p, "rejected")}>Reject</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
