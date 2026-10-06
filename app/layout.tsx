import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.elitextrading.ca"),

  title: {
    default:
      "Elite X Trading Journal | Trading Analytics & Performance Intelligence",
    template: "%s | Elite X Trading Journal",
  },

  description:
    "Elite X is a professional trading journal and performance analytics platform for tracking trades, analyzing performance, reviewing execution, and improving trading decisions.",

  applicationName: "Elite X Trading Journal",

  openGraph: {
    type: "website",
    url: "https://www.elitextrading.ca/",
    siteName: "Elite X Trading Journal",
    title:
      "Elite X Trading Journal | Trading Analytics & Performance Intelligence",
    description:
      "Elite X is a professional trading journal and performance analytics platform for tracking trades, analyzing performance, reviewing execution, and improving trading decisions.",
    locale: "en_CA",
  },

  twitter: {
    card: "summary",
    title:
      "Elite X Trading Journal | Trading Analytics & Performance Intelligence",
    description:
      "Elite X is a professional trading journal and performance analytics platform for tracking trades, analyzing performance, reviewing execution, and improving trading decisions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}