"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, ShoppingCart, Package, Settings, Home } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getCartCount } from "@/lib/shopping/cart-utils";

export function MobileNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const interval = setInterval(() => setCartCount(getCartCount()), 2000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/app/new", icon: ChefHat, label: "Rezept" },
    { href: "/app/shopping-list", icon: ShoppingCart, label: "Einkauf", badge: cartCount },
    { href: "/app/pantry", icon: Package, label: "Vorrat" },
    { href: "/app/settings", icon: Settings, label: t.nav.settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-2 py-2 text-[10px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {"badge" in item && (item.badge ?? 0) > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {(item.badge ?? 0) > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
