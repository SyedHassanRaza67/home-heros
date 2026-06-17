import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, BadgeCheck, Sparkles, MessagesSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Why trust Home Hero — About us" },
      { name: "description", content: "Verified professionals, upfront pricing, satisfaction guarantee, and real customer reviews." },
      { property: "og:title", content: "Why trust Home Hero" },
      { property: "og:description", content: "Verified pros, transparent prices, real reviews." },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Verified professionals",
    desc: "Every provider's CNIC and photo are checked by our team before they're allowed to accept a single booking.",
  },
  {
    icon: BadgeCheck,
    title: "Upfront fixed pricing",
    desc: "The price you see when booking is the price you pay. No add-ons, no surprise fees after the job.",
  },
  {
    icon: Sparkles,
    title: "Satisfaction guarantee",
    desc: "If the work isn't right, tell us. We'll send another professional or make it right — no questions asked.",
  },
  {
    icon: MessagesSquare,
    title: "Real customer reviews",
    desc: "Only customers who actually completed a job can leave a star rating, so every review you see is honest.",
  },
];

function AboutPage() {
  const { data: reviews = [] } = useQuery({
    queryKey: ["public-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating, comment, created_at, providers(full_name)")
        .gte("rating", 4)
        .not("comment", "is", null)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as { rating: number; comment: string | null; created_at: string; providers: { full_name: string } | null }[];
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-secondary/60 to-background">
          <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Why trust Home Hero</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We built Home Hero so booking a home service in Pakistan feels as safe as ordering food online.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PILLARS.map((p) => (
              <Card key={p.title}>
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">{p.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-center text-2xl font-bold">What customers are saying</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {reviews.map((r, i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <StarRating value={r.rating} />
                      <p className="mt-3 text-sm text-foreground">"{r.comment}"</p>
                      {r.providers?.full_name && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          For {r.providers.full_name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 rounded-2xl border bg-secondary/40 p-6 text-center">
            <h3 className="text-xl font-semibold">Book with confidence.</h3>
            <p className="mt-2 text-sm text-muted-foreground">A verified pro is one tap away.</p>
            <Button size="lg" className="mt-4" asChild>
              <Link to="/book">Book a service</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
