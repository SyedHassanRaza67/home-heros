import { Link, useNavigate } from "@tanstack/react-router";
import { Wrench, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORT_CONTACT } from "@/lib/contact";

export function SiteHeader() {
  const { user, isAdmin, isProvider } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const primaryLink = (to: string, label: string, secondary = false) => (
    <Link
      to={to}
      className={
        "text-sm font-medium hover:text-primary " +
        (secondary ? "hidden lg:inline-flex" : "")
      }
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  );

  const links = (
    <>
      {primaryLink("/", "Home")}
      {primaryLink("/book", "Book a service")}
      {primaryLink("/how-it-works", "How it works", true)}
      {primaryLink("/about", "About", true)}
      {primaryLink("/contact", "Contact", true)}
      {user && primaryLink("/my-bookings", "My bookings")}
      {isProvider && primaryLink("/provider", "Provider")}
      {isAdmin && primaryLink("/admin", "Admin")}
      {user && !isProvider && !isAdmin && primaryLink("/become-provider", "Become a provider", true)}
    </>
  );

  // Mobile menu: all links visible (no lg: gating)
  const mobileLinks = (
    <>
      <Link to="/" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Home</Link>
      <Link to="/book" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Book a service</Link>
      <Link to="/how-it-works" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>How it works</Link>
      <Link to="/about" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>About</Link>
      <Link to="/contact" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Contact</Link>
      {user && <Link to="/my-bookings" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>My bookings</Link>}
      {isProvider && <Link to="/provider" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Provider</Link>}
      {isAdmin && <Link to="/admin" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Admin</Link>}
      {user && !isProvider && !isAdmin && (
        <Link to="/become-provider" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>Become a provider</Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Home Hero</span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-5 md:flex">{links}</nav>

        <div className="hidden items-center gap-2 md:flex">
          <WhatsAppButton phone={SUPPORT_CONTACT.whatsapp} label="WhatsApp" />
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/book">Book now</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            {mobileLinks}
            <div className="flex flex-col gap-2 pt-2">
              <WhatsAppButton phone={SUPPORT_CONTACT.whatsapp} label="Message us on WhatsApp" className="w-full justify-center" />
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut} className="w-full">
                  <LogOut className="mr-1 h-4 w-4" /> Sign out
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link to="/book">Book now</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
