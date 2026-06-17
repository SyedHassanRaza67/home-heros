import { Link, useNavigate } from "@tanstack/react-router";
import { Wrench, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user, isAdmin, isProvider } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const links = (
    <>
      <Link to="/" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
        Home
      </Link>
      <Link to="/book" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
        Book a service
      </Link>
      {user && (
        <Link to="/my-bookings" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
          My bookings
        </Link>
      )}
      {isProvider && (
        <Link to="/provider" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
          Provider
        </Link>
      )}
      {isAdmin && (
        <Link to="/admin" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
          Admin
        </Link>
      )}
      {user && !isProvider && !isAdmin && (
        <Link to="/become-provider" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
          Become a provider
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">HomeFix</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">{links}</nav>

        <div className="hidden items-center gap-2 md:flex">
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
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            {links}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut} className="w-full">
                  <LogOut className="mr-1 h-4 w-4" /> Sign out
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link to="/book">Book now</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
