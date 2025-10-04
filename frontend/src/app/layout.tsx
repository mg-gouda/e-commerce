'use client';

import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const cairo = Cairo({ subsets: ["latin"] });

function FaviconUpdater() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.faviconUrl) {
      // Update favicon
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      // Handle different URL formats
      const faviconUrl = settings.faviconUrl.startsWith('data:') || settings.faviconUrl.startsWith('http') || settings.faviconUrl.startsWith('/')
        ? settings.faviconUrl.startsWith('/uploads')
          ? `${process.env.NEXT_PUBLIC_API_URL}${settings.faviconUrl}`
          : settings.faviconUrl
        : `${process.env.NEXT_PUBLIC_API_URL}${settings.faviconUrl}`;
      link.href = faviconUrl;
    }
  }, [settings.faviconUrl]);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body className={cairo.className}>
        <ErrorBoundary>
          <QueryProvider>
            <SiteSettingsProvider>
              <SettingsProvider>
                <FaviconUpdater />
                <Toaster position="top-right" richColors />
                {isAdminRoute ? (
                  // Admin routes - no frontend header/footer
                  children
                ) : (
                  // Frontend routes - with header/footer
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-grow">
                      {children}
                    </main>
                    <Footer />
                  </div>
                )}
              </SettingsProvider>
            </SiteSettingsProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
