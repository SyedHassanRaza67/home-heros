import { Link } from "@tanstack/react-router";
import { Wrench, Phone, Mail } from "lucide-react";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SUPPORT_CONTACT } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-base font-bold">Aram Karo</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Trusted home services in {SUPPORT_CONTACT.area}.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary">About / Why trust us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary">How it works</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/become-provider" className="hover:text-primary">Become a provider</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Get in touch</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={`tel:${SUPPORT_CONTACT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-primary">
                  <Phone className="h-3.5 w-3.5" /> {SUPPORT_CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-primary">
                  <Mail className="h-3.5 w-3.5" /> {SUPPORT_CONTACT.email}
                </a>
              </li>
              <li className="pt-1">
                <WhatsAppButton phone={SUPPORT_CONTACT.whatsapp} label="WhatsApp us" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Aram Karo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
