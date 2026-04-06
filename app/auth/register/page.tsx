"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/shared/page-transition";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { useAuth } from "@/lib/supabase/auth";
import { useTranslation } from "@/lib/i18n";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(t.auth.passwordMinLength ?? "Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t.auth.verifyEmailSent ?? "Bestätigungscode gesendet!");
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
    setLoading(false);
  }

  return (
    <PageTransition className="container flex min-h-[60vh] max-w-md items-center justify-center py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.auth.registerTitle}</CardTitle>
          <CardDescription>{t.auth.registerDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Login */}
          <SocialLoginButtons />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t.auth.orWithEmail ?? "oder mit E-Mail"}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {t.auth.registerButton}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.hasAccount}{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              {t.auth.loginButton}
            </Link>
          </p>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
