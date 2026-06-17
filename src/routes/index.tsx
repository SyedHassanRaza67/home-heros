import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Zap, Snowflake, Wrench, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrustBadges } from "@/components/trust-badges";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HomeFix — Book trusted home services in Islamabad & Rawalpindi" },
      { name: "description", content: "Book electricians, AC repair and more at fixed, transparent prices. Vetted technicians, same-day service." },
    ],
  }),
  component: Home,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Snowflake,
  Wrench,
};

function Home() {
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Tables<"services">[];
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/60 to-background">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Vetted technicians · Fixed prices
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Book trusted home services in{" "}
                <span className="text-primary">Islamabad &amp; Rawalpindi</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Skilled electricians and AC technicians at your doorstep — at honest,
                upfront prices. No surprises.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/book">Book a service</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#services">See services</a>
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-3xl">
              <TrustBadges />
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Our services</h2>
            <p className="mt-3 text-muted-foreground">
              Transparent prices. No hidden fees. Pay only when the job is done.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((s) => {
              const Icon = iconMap[s.icon ?? "Wrench"] ?? Wrench;
              return (
                <Card key={s.id} className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xl font-semibold">{s.name}</h3>
                          <span className="rounded-full bg-accent/30 px-3 py-1 text-sm font-bold text-foreground">
                            {s.currency} {Number(s.price).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                        <Button asChild className="mt-4 w-full" size="sm">
                          <Link to="/book" search={{ service: s.slug }}>
                            Book {s.name}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-secondary/40 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { n: "1", t: "Pick a service", d: "Choose what you need fixed — electrician or AC repair." },
                { n: "2", t: "Book a time", d: "Tell us when and where. We'll send a vetted technician." },
                { n: "3", t: "Get it done", d: "Pay the fixed price when the job is complete. That's it." },
              ].map((step) => (
                <div key={step.n} className="rounded-2xl bg-card p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {step.n}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/how-it-works" className="text-sm font-medium text-primary hover:underline">
                Learn more about how HomeFix works →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
