import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SUPPORT_CONTACT } from "@/lib/contact";

const CONTACT = SUPPORT_CONTACT;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Home Hero" },
      { name: "description", content: "Reach Home Hero by phone, email, or WhatsApp. We're here to help." },
      { property: "og:title", content: "Contact Home Hero" },
      { property: "og:description", content: "Phone, email, and WhatsApp — pick whatever's easiest." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-secondary/60 to-background">
          <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Get in touch</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We answer fast. Pick whatever's easiest for you.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Call us</h2>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="mt-2 block text-lg font-semibold hover:text-primary">
                  {CONTACT.phone}
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Email</h2>
                <a href={`mailto:${CONTACT.email}`} className="mt-2 block text-lg font-semibold hover:text-primary">
                  {CONTACT.email}
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-success/15 text-success">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">WhatsApp</h2>
                <p className="mt-2 text-sm text-muted-foreground">{CONTACT.whatsapp}</p>
                <div className="mt-3 flex justify-center">
                  <WhatsAppButton
                    phone={CONTACT.whatsapp}
                    label="Message on WhatsApp"
                    message="Hi Home Hero, I'd like some help."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Service area: <span className="font-medium text-foreground">{CONTACT.area}</span>
              <p className="mt-1">Customer support: 9am – 9pm, every day.</p>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
