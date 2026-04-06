"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition, SlideUp, StaggerContainer, StaggerItem } from "@/components/shared/page-transition";
import {
  ChefHat,
  ArrowRight,
  Link2,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  ShoppingCart,
  ListChecks,
  Leaf,
  BarChart3,
  CalendarDays,
  CookingPot,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [heroUrl, setHeroUrl] = useState("");

  function handleHeroSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!heroUrl.trim()) return;
    router.push(`/app/new?url=${encodeURIComponent(heroUrl.trim())}`);
  }

  const steps = [
    {
      icon: Link2,
      step: "1",
      title: "URL einfügen",
      description: "Kopiere den Link eines Rezept-Videos von TikTok, Instagram, YouTube oder Facebook.",
    },
    {
      icon: Sparkles,
      step: "2",
      title: "KI analysiert das Video",
      description: "Unsere KI schaut das Video, erkennt Zutaten, Mengen und Schritte automatisch.",
    },
    {
      icon: ClipboardList,
      step: "3",
      title: "Strukturiertes Rezept",
      description: "Du erhaltst ein sauberes Rezept mit Zutatenliste, Schritten und Einkaufsliste.",
    },
  ];

  const features = [
    {
      icon: ShoppingCart,
      title: "Zutaten & Mengen automatisch erkannt",
      description: "Die KI erkennt alle Zutaten und deren genaue Mengenangaben aus dem Video.",
    },
    {
      icon: ListChecks,
      title: "Einkaufsliste sofort generiert",
      description: "Mit einem Klick wird eine Einkaufsliste erstellt — sortiert nach Supermarkt-Gang.",
    },
    {
      icon: CookingPot,
      title: "Schritt-für-Schritt Modus",
      description: "Koche Schritt für Schritt nach — optimiert für die Küche, freihändig bedienbar.",
    },
    {
      icon: Leaf,
      title: "Was habe ich da? → Rezeptvorschläge",
      description: "Trage ein was du zuhause hast — wir zeigen dir welche Rezepte du sofort kochen kannst.",
    },
    {
      icon: BarChart3,
      title: "Nährwerte & Saisonalität",
      description: "Kalorien, Protein, Kohlenhydrate auf einen Blick. Saisonale Zutaten markiert.",
    },
    {
      icon: CalendarDays,
      title: "Familien-Einkauf & Events",
      description: "Teile Einkaufslisten mit der Familie. Plane Grillpartys — jeder sieht was er mitbringt.",
    },
  ];

  return (
    <PageTransition className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />

        <div className="container relative flex flex-col items-center py-20 text-center md:py-32 lg:py-40">
          <SlideUp>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <ChefHat className="h-4 w-4" />
              Dein KI-Rezeptassistent
            </div>
          </SlideUp>

          <SlideUp delay={0.1}>
            <h1 className="mt-8 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Jedes Rezept-Video.{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Sofort als echtes Rezept.
              </span>
            </h1>
          </SlideUp>

          <SlideUp delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Füge einfach den Link eines Rezept-Videos ein — unsere KI extrahiert automatisch
              Zutaten, Mengen und Schritte. Nie wieder das Video zurückspulen.
            </p>
          </SlideUp>

          <SlideUp delay={0.3}>
            <form
              onSubmit={handleHeroSubmit}
              className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Link2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="https://tiktok.com/... oder instagram.com/reel/..."
                  className="h-14 rounded-xl border-2 border-primary/20 bg-background pl-12 pr-4 text-base shadow-lg shadow-primary/5 transition-all focus:border-primary focus:shadow-primary/10 md:text-lg"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 gap-2 rounded-xl px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 md:text-lg"
                disabled={!heroUrl.trim()}
              >
                <ChefHat className="h-5 w-5" />
                Rezept extrahieren
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </SlideUp>

          <SlideUp delay={0.4}>
            <p className="mt-4 text-sm text-muted-foreground">
              Egal ob TikTok, Instagram, YouTube oder Facebook
            </p>
          </SlideUp>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">So funktioniert es</h2>
            <p className="mt-3 text-muted-foreground">In drei einfachen Schritten zum perfekten Rezept</p>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-3 md:gap-12">
            {steps.map((item, index) => (
              <SlideUp key={item.step} delay={index * 0.1}>
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Alles was du brauchst</h2>
            <p className="mt-3 text-muted-foreground">Mehr als nur ein Rezept -- ein komplettes Koch-Erlebnis</p>
          </div>
          <StaggerContainer className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="group h-full border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Trust section */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-start gap-4 rounded-2xl border border-primary/10 bg-background p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Transparenz bei KI-Ergebnissen</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  KI-Ergebnisse konnen Fehler enthalten. Wir kennzeichnen unsichere Daten klar --
                  z.B. geschätzte Mengenangaben oder fehlende Informationen aus dem Video.
                  Überprüfe Rezepte immer vor dem Nachkochen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact footer CTA */}
      <section className="py-16 md:py-20">
        <div className="container text-center">
          <SlideUp>
            <ChefHat className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="text-2xl font-bold md:text-3xl">Bereit für dein nächstes Rezept?</h2>
            <p className="mt-2 text-muted-foreground">Kopiere einfach einen Video-Link und los geht&apos;s.</p>
            <Button
              size="lg"
              className="mt-6 gap-2 rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
              onClick={() => router.push("/app/new")}
            >
              <ChefHat className="h-5 w-5" />
              Jetzt loslegen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </SlideUp>
        </div>
      </section>
    </PageTransition>
  );
}
