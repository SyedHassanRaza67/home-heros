import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { BookingStatus, Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin dashboard — HomeFix" }] }),
  component: AdminPage,
});

const STATUSES: BookingStatus[] = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
    } else if (!isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/", replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"bookings">[];
    },
  });

  async function updateStatus(id: string, status: BookingStatus) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  }

  const counts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="container mx-auto flex flex-1 items-center justify-center p-8 text-muted-foreground">
          Loading…
        </div>
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
            <p className="text-sm text-muted-foreground">All bookings across customers.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {STATUSES.map((s) => (
              <Card key={s}>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.replace("_", " ")}</p>
                  <p className="mt-1 text-2xl font-bold">{counts[s] ?? 0}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {isLoading && <p className="text-muted-foreground">Loading…</p>}

          {!isLoading && bookings.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                No bookings yet.
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{b.service_name}</h3>
                        <StatusBadge status={b.status} />
                        <span className="text-sm font-semibold text-muted-foreground">
                          PKR {Number(b.price).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid gap-1 text-sm md:grid-cols-2">
                        <p><span className="text-muted-foreground">Customer:</span> {b.customer_name ?? "—"}</p>
                        <p><span className="text-muted-foreground">Phone:</span> {b.phone}</p>
                        <p><span className="text-muted-foreground">When:</span> {format(new Date(b.booking_date), "PPP")} at {b.booking_time.slice(0, 5)}</p>
                        <p><span className="text-muted-foreground">Booked:</span> {format(new Date(b.created_at), "PP p")}</p>
                        <p className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {b.address}</p>
                        {b.notes && <p className="md:col-span-2"><span className="text-muted-foreground">Notes:</span> {b.notes}</p>}
                      </div>
                    </div>
                    <div className="md:w-48">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Update status</label>
                      <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as BookingStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
