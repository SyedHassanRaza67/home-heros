import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/become-provider")({
  head: () => ({
    meta: [
      { title: "Become a provider — HomeFix" },
      { name: "description", content: "Apply to join HomeFix as a verified service provider." },
    ],
  }),
  component: BecomeProviderPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone"),
  cnic: z.string().trim().regex(/^\d{5}-?\d{7}-?\d{1}$/, "Enter a valid CNIC (e.g. 12345-1234567-1)"),
  service_slug: z.string().min(1, "Pick a service"),
  city: z.string().trim().min(2, "Enter your city/area").max(100),
});

function BecomeProviderPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serviceSlug, setServiceSlug] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (error) throw error;
      return data as Tables<"services">[];
    },
  });

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["my-provider", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);

    const parsed = schema.safeParse({
      full_name: fd.get("full_name"),
      phone: fd.get("phone"),
      cnic: fd.get("cnic"),
      service_slug: serviceSlug,
      city: fd.get("city"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!photoFile) {
      toast.error("Please upload a verification photo");
      return;
    }

    setSubmitting(true);
    try {
      const ext = photoFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("provider-photos")
        .upload(path, photoFile, { upsert: true });
      if (upErr) throw upErr;

      const { error } = await supabase.from("providers").insert({
        user_id: user.id,
        ...parsed.data,
        photo_url: path,
      });
      if (error) throw error;

      toast.success("Application submitted! Admin will review shortly.");
      navigate({ to: "/provider" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user || loadingExisting) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="container mx-auto flex flex-1 items-center justify-center p-8 text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (existing) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 bg-secondary/30">
          <div className="container mx-auto max-w-xl px-4 py-10">
            <Card>
              <CardHeader>
                <CardTitle>Provider application</CardTitle>
                <CardDescription>Your application status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="capitalize">{existing.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {existing.status === "pending" && "We're reviewing your application. You'll be notified once approved."}
                  {existing.status === "approved" && "You're approved! Visit your dashboard to accept jobs."}
                  {existing.status === "rejected" && "Unfortunately your application was rejected. Contact support for details."}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button asChild><Link to="/provider">Go to dashboard</Link></Button>
                  <Button asChild variant="outline"><Link to="/">Home</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto max-w-xl px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Become a provider</CardTitle>
              <CardDescription>
                Apply to join HomeFix. Admin will verify and approve your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="03XX XXXXXXX" required />
                </div>
                <div className="space-y-2">
                  <Label>Service type</Label>
                  <Select value={serviceSlug} onValueChange={setServiceSlug}>
                    <SelectTrigger><SelectValue placeholder="Pick a service" /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City / area</Label>
                  <Input id="city" name="city" placeholder="e.g. Islamabad — F-10" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC number</Label>
                  <Input id="cnic" name="cnic" placeholder="12345-1234567-1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Verification photo (CNIC or selfie)</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used only by admin for verification.
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
