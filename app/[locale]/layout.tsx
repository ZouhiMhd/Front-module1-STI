import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/config/i18n/routing";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { AuthProvider } from "@/app/components/auth/AuthContext";
import {Navbar} from "@/app/components/Navbar";
import {Footer} from "@/app/components/landing/Footer";
import { ClinicalCaseProvider } from '@/app/components/auth/ClinicalCaseContext'; // Ajuste le chemin
import OnboardingTour from '@/app/components/tour/OnboardingTour';
import { OnboardingTourProvider } from '@/app/components/tour/OnboardingTourContext';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedExpert - Clinical Case Validation Platform",
  description:
    "Build reliable medical datasets through expert validation. MedExpert enables medical professionals to review and verify clinical cases for better healthcare outcomes.",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as "en" | "fr")) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <ClinicalCaseProvider>
                <OnboardingTourProvider>
                  <OnboardingTour />
                  <Navbar />
                  <main className="mt-16">
                    {children}
                  </main>
                  <Footer />
                </OnboardingTourProvider>
              </ClinicalCaseProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
