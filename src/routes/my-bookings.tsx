import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { format } from "date-fns";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
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
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"bookings">[];
    },
  });

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
                <Button className="mt-4" asChild>
                  <Link to="/book">Book your first service</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {bookings.map((b) => (
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
