"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChefHat, History, ShoppingCart, Package, Settings, LogIn, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/supabase/auth";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { getCartCount } from "@/lib/shopping/cart-utils";

export function Navbar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const interval = setInterval(() => setCartCount(getCartCount()), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="text-base">{t.nav.brand}</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/app/new"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <ChefHat className="h-4 w-4" />
            Rezept
          </Link>
          <Link
            href="/app/shopping-list"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <div className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </div>
            Einkauf
          </Link>
          <Link
            href="/app/pantry"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <Package className="h-4 w-4" />
            Vorrat
          </Link>
          <Link
            href="/app/history"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <History className="h-4 w-4" />
            {t.nav.saved}
          </Link>
          <Link
            href="/app/settings"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <Settings className="h-4 w-4" />
            {t.nav.settings}
          </Link>
          <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? (
              <Link
                href="/app/profile"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                title={user.email ?? "Profile"}
              >
                <User className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogIn className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
