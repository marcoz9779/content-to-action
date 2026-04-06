import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.voltastudio.contenttoaction",
  appName: "Content to Action",
  webDir: "out",
  server: {
    // In development, point to the Next.js dev server
    // Comment this out for production builds
    url: "http://localhost:3001",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#ffffff",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Content to Action",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
