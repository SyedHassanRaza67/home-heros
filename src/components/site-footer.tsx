export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} HomeFix — Trusted home services in Islamabad &amp; Rawalpindi.</p>
      </div>
    </footer>
  );
}
