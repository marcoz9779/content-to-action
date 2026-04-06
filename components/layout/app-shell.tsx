import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { Toaster } from "@/components/ui/toaster";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <Footer />
      <MobileNav />
      <Toaster />
    </div>
  );
}
