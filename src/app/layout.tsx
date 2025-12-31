import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Footer } from "@/components/footer";
import { SettingsProvider } from "@/context/SettingsContext";
import { RandomizerAudioProvider } from "@/context/RandomizerAudioContext";
import { MenuOrderProvider } from "@/context/MenuOrderContext";

export const metadata: Metadata = {
  title: "Randomizer Fun - Your fun-filled tool for making choices!",
  description:
    "A fun app to randomize anything! and Your fun-filled tool for making choices!",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Parastoo:wght@400..700&display=swap" rel="stylesheet" />
        <meta name="application-name" content="Randomizer" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Randomizer" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="google-adsense-account" content="ca-pub-6645630836894301" />
      </head>
      <body className="font-body antialiased min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SettingsProvider>
              <MenuOrderProvider>
                <RandomizerAudioProvider>
                  {children}
                  <Toaster />
                </RandomizerAudioProvider>
              </MenuOrderProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
      {/* Tempatkan komponen GTM di sini. Secara default, ini akan memuat script GTM setelah hidrasi. */}
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ""} />
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GTM_ID || ""} />
    </html>
  );
}
