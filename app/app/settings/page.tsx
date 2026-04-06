"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Globe, Check, Sun, Moon, Monitor } from "lucide-react";
import { useTranslation, LOCALE_LABELS } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { PageTransition } from "@/components/shared/page-transition";
import type { Locale } from "@/lib/i18n";

const LOCALES: Locale[] = ["de", "en", "fr", "it"];

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <PageTransition className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.settingsPage.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.settingsPage.description}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" />
              {t.settingsPage.languageTitle}
            </CardTitle>
            <CardDescription>{t.settingsPage.languageDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {LOCALES.map((loc) => (
                <Button
                  key={loc}
                  variant={locale === loc ? "default" : "outline"}
                  className="justify-start gap-2"
                  onClick={() => setLocale(loc)}
                >
                  {locale === loc && <Check className="h-4 w-4" />}
                  {LOCALE_LABELS[loc]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sun className="h-5 w-5" />
              Design
            </CardTitle>
            <CardDescription>Light, Dark, or System theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <Button
                  key={t.value}
                  variant={theme === t.value ? "default" : "outline"}
                  className="justify-center gap-2"
                  onClick={() => setTheme(t.value)}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              {t.settingsPage.accountTitle}
            </CardTitle>
            <CardDescription>{t.settingsPage.accountDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.settingsPage.accountNote}</p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
