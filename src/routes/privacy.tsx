import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Home Hero" },
      { name: "description", content: "How Home Hero collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Home Hero" },
      { property: "og:description", content: "Our privacy practices, in plain language." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const updated = "June 17, 2026";
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/20">
        <article className="container mx-auto max-w-3xl px-4 py-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
          </header>

          <div className="space-y-6 rounded-2xl border bg-card p-6 text-sm leading-relaxed md:text-base">
            <Section title="1. Information we collect">
              When you sign up and book a service we collect your name, phone number, email, service address,
              and the details of your booking. Providers also submit their CNIC and a verification photo.
            </Section>

            <Section title="2. How we use your information">
              We use your information to: confirm bookings, dispatch a verified professional, contact you about
              your service, process payments where applicable, prevent fraud, and improve the platform.
            </Section>

            <Section title="3. Sharing with providers">
              To complete a booking we share your name, phone number, address, and the booking details with
              the assigned provider. Providers are bound by our terms not to use this information for any
              purpose other than fulfilling your booking.
            </Section>

            <Section title="4. Storage and security">
              Your data is stored securely with our cloud provider and protected by industry-standard access
              controls. Provider verification photos are stored in a private bucket and only viewable by
              Home Hero administrators.
            </Section>

            <Section title="5. Your rights">
              You may request a copy of your personal data, ask us to correct inaccurate details, or request
              that your account and personal data be deleted. Contact us using the details on the Contact
              page to exercise any of these rights.
            </Section>

            <Section title="6. Cookies and analytics">
              We use essential cookies to keep you signed in. We may use privacy-respecting analytics to
              understand how the platform is used. We do not sell your data.
            </Section>

            <Section title="7. Children">
              Home Hero is not intended for users under 18. We do not knowingly collect personal data from
              children.
            </Section>

            <Section title="8. Changes to this policy">
              We may update this policy from time to time. The "last updated" date at the top will always
              reflect the latest version.
            </Section>

            <Section title="9. Contact">
              For privacy questions or requests, reach us through the{" "}
              <a href="/contact" className="text-primary underline">Contact page</a>.
            </Section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground md:text-lg">{title}</h2>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </section>
  );
}
