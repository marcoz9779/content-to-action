"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/shared/page-transition";
import { useAuth } from "@/lib/supabase/auth";
import { useTranslation } from "@/lib/i18n";
import { User, Mail, LogOut, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    toast.success(t.auth.logoutButton);
    router.push("/");
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <PageTransition className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.auth.profileTitle}</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              {t.settingsPage.accountTitle}
            </CardTitle>
            <CardDescription>{t.auth.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.email}
                </div>
                {user.created_at && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(user.created_at)}
                  </div>
                )}
              </div>
            </div>

            <Button variant="destructive" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              {t.auth.logoutButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
