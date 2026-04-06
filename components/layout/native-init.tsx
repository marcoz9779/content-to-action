"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { isNativePlatform, setStatusBarStyle } from "@/lib/native";

export function NativeInit() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!isNativePlatform()) return;

    // Add native class to html for CSS targeting
    document.documentElement.classList.add("native-app");
    document.documentElement.classList.add("native-safe-top");

    // Hide splash screen after app loads
    import("@capacitor/splash-screen").then(({ SplashScreen }) => {
      SplashScreen.hide();
    }).catch(() => {});

    // Handle back button on Android
    import("@capacitor/app").then(({ App }) => {
      App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    }).catch(() => {});
  }, []);

  // Sync status bar with theme
  useEffect(() => {
    if (!isNativePlatform()) return;
    setStatusBarStyle(resolvedTheme === "dark");
  }, [resolvedTheme]);

  return null;
}
