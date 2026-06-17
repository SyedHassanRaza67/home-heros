import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ShieldCheck, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrustBadges } from "@/components/trust-badges";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Aram Karo" },
      { name: "description", content: "Three simple steps to book a verified professional in Islamabad or Rawalpindi." },
      { property: "og:title", content: "How Aram Karo works" },
      { property: "og:description", content: "Book a service, get a verified pro, and pay only when the job is done." },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Book a service",
    desc: "Pick what you need fixed, choose a date and time, and tell us where. Fixed price shown upfront — no surprises.",
  },
  {
    icon: ShieldCheck,
    title: "A verified professional is assigned",
    desc: "Every provider on Aram Karo has their CNIC and photo verified by our team before they ever take a job.",
  },
  {
    icon: Star,
    title: "Job done — you pay and rate",
    desc: "Pay the technician after the work is complete, then leave a star rating so the next customer knows what to expect.",
  },
];

function HowItWorks() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-secondary/60 to-background">
          <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">How Aram Karo works</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps from request to a clean, finished job.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-12">
          <ol className="space-y-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-5 rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className="h-full w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">{s.title}</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-2xl border bg-secondary/40 p-6 text-center">
            <h3 className="text-xl font-semibold">Ready when you are.</h3>
            <p className="mt-2 text-sm text-muted-foreground">Book a vetted technician in under a minute.</p>
            <Button size="lg" className="mt-4" asChild>
              <Link to="/book">Book a service</Link>
            </Button>
          </div>

          <div className="mt-10">
            <TrustBadges />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
