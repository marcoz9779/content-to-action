/**
 * Native platform utilities.
 * These are safe to call on web — they no-op when Capacitor isn't available.
 */

export function isNativePlatform(): boolean {
  return typeof window !== "undefined" && "Capacitor" in window;
}

export async function hapticFeedback(style: "light" | "medium" | "heavy" = "light"): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: styleMap[style] });
  } catch {
    // Haptics not available
  }
}

export async function hapticNotification(type: "success" | "warning" | "error" = "success"): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };
    await Haptics.notification({ type: typeMap[type] });
  } catch {
    // Haptics not available
  }
}

export async function setStatusBarStyle(isDark: boolean): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  } catch {
    // StatusBar not available
  }
}
