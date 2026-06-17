import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/status-badge";
import { BookingProgress } from "@/components/booking-progress";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { PageLoading } from "@/components/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/provider")({
  head: () => ({ meta: [{ title: "Provider dashboard — Home Hero" }] }),
  component: ProviderPage,
});

function ProviderPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const { data: provider, isLoading: loadingProvider } = useQuery({
    queryKey: ["my-provider", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["provider-bookings", provider?.id],
    enabled: !!provider && provider.status === "approved",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("provider_id", provider!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"bookings">[];
    },
  });

  async function toggleAvailability(value: boolean) {
    if (!provider) return;
    const { error } = await supabase
      .from("providers")
      .update({ is_available: value })
      .eq("id", provider.id);
    if (error) return toast.error(error.message);
    toast.success(value ? "You're now available" : "Marked unavailable");
    qc.invalidateQueries({ queryKey: ["my-provider", user?.id] });
  }

  async function updateBooking(id: string, patch: Partial<Tables<"bookings">>) {
    const { error } = await supabase.from("bookings").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["provider-bookings", provider?.id] });
  }

  if (loading || loadingProvider) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <PageLoading />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 bg-secondary/30">
          <div className="container mx-auto max-w-xl px-4 py-10">
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold">You're not a provider yet</h1>
                <p className="text-muted-foreground">Apply to join Home Hero as a verified provider.</p>
                <Button asChild><Link to="/become-provider">Apply now</Link></Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Provider dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {provider.full_name}</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="capitalize">{provider.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {provider.service_slug} · {provider.city}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Available</span>
                <Switch
                  checked={provider.is_available}
                  disabled={provider.status !== "approved"}
                  onCheckedChange={toggleAvailability}
                />
              </div>
            </CardContent>
          </Card>

          {provider.status === "pending" && (
            <Card className="mb-6 border-warning/40 bg-warning/10">
              <CardContent className="p-5 text-sm">
                Your account is pending admin approval. You'll be able to accept bookings once approved.
              </CardContent>
            </Card>
          )}
          {provider.status === "rejected" && (
            <Card className="mb-6 border-destructive/40 bg-destructive/10">
              <CardContent className="p-5 text-sm">
                Your application was rejected. Contact support for more info.
              </CardContent>
            </Card>
          )}

          <h2 className="text-lg font-semibold mb-3">Assigned bookings</h2>

          {provider.status === "approved" && bookings.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No bookings assigned yet.</CardContent></Card>
          )}

          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-5 space-y-3">
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
                    <p className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {b.address}</p>
                    {b.notes && <p className="md:col-span-2"><span className="text-muted-foreground">Notes:</span> {b.notes}</p>}
                  </div>
                  <div className="pt-1">
                    <BookingProgress status={b.status} />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(b.status === "assigned" || b.status === "pending") && (
                      <>
                        <Button size="sm" onClick={() => updateBooking(b.id, { status: "confirmed" })}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => updateBooking(b.id, { status: "rejected_by_provider", provider_id: null })}>Reject</Button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <Button size="sm" onClick={() => updateBooking(b.id, { status: "in_progress" })}>On the way</Button>
                    )}
                    {b.status === "in_progress" && (
                      <Button size="sm" onClick={() => updateBooking(b.id, { status: "completed" })}>Mark completed</Button>
                    )}
                    {b.status !== "cancelled" && b.status !== "rejected_by_provider" && (
                      <WhatsAppButton
                        phone={b.phone}
                        label={`Message ${(b.customer_name ?? "customer").split(" ")[0]}`}
                        message={`Hi, regarding your ${b.service_name} booking on ${format(new Date(b.booking_date), "PPP")}.`}
                      />
                    )}
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
