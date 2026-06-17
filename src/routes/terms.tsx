import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Home Hero" },
      { name: "description", content: "The terms that govern your use of Home Hero services." },
      { property: "og:title", content: "Terms of Service — Home Hero" },
      { property: "og:description", content: "Terms governing the use of Home Hero." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const updated = "June 17, 2026";
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/20">
        <article className="container mx-auto max-w-3xl px-4 py-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Terms of Service</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
          </header>

          <div className="prose-sm space-y-6 rounded-2xl border bg-card p-6 text-sm leading-relaxed md:text-base">
            <Section title="1. Acceptance of terms">
              By creating an account or booking a service through Home Hero ("the platform"), you agree to these
              Terms of Service. If you do not agree, please don't use the platform.
            </Section>

            <Section title="2. Our service">
              Home Hero connects customers in Pakistan with independent home-service professionals (electricians,
              AC technicians, and similar trades). Home Hero is a marketplace — providers are not our employees.
            </Section>

            <Section title="3. Bookings and payments">
              Prices shown at booking are fixed and inclusive of the listed service. Payment is currently made
              directly to the provider in cash after the job is completed. Additional digital payment options
              may be added later and will be governed by the same terms unless stated otherwise.
            </Section>

            <Section title="4. Cancellations">
              You may cancel a booking free of charge before a provider has been assigned. After assignment,
              repeated last-minute cancellations may result in account suspension.
            </Section>

            <Section title="5. Provider conduct">
              Providers are verified (CNIC and photo) before they can accept bookings, but they remain
              independent contractors. Home Hero is not responsible for damages caused by a provider's conduct,
              though we will investigate complaints in good faith and may remove providers who breach our
              standards.
            </Section>

            <Section title="6. Customer conduct">
              You agree to provide accurate information when booking, to treat providers respectfully, and to
              pay the agreed price upon completion of the work.
            </Section>

            <Section title="7. Limitation of liability">
              To the maximum extent permitted by law, Home Hero is not liable for indirect, incidental, or
              consequential damages arising from your use of the platform. Our total liability for any claim
              is limited to the price of the booking giving rise to the claim.
            </Section>

            <Section title="8. Changes to these terms">
              We may update these terms from time to time. Material changes will be communicated through the
              app or by email. Continued use after a change means you accept the updated terms.
            </Section>

            <Section title="9. Governing law">
              These terms are governed by the laws of the Islamic Republic of Pakistan. Any dispute will be
              subject to the exclusive jurisdiction of the courts of Islamabad.
            </Section>

            <Section title="10. Contact">
              Questions? Reach us through the <a href="/contact" className="text-primary underline">Contact page</a>.
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
