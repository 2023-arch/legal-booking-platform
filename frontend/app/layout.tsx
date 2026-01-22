import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LegalBook - Book Verified Lawyers Online | Legal Consultation India",
    template: "%s | LegalBook"
  },
  description: "Connect with 500+ verified lawyers across India. Instant video consultations for divorce, property disputes, criminal defense, corporate law. Secure, confidential, and affordable legal help.",
  keywords: [
    "lawyers india",
    "online lawyer consultation",
    "book lawyer online",
    "legal advice india",
    "divorce lawyer",
    "property dispute lawyer",
    "criminal lawyer",
    "video consultation lawyer",
    "verified lawyers india"
  ],
  authors: [{ name: "LegalBook" }],
  creator: "LegalBook",
  publisher: "LegalBook",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://legal-booking-platform.vercel.app'),
  openGraph: {
    title: "LegalBook - Book Verified Lawyers Online in India",
    description: "Connect with 500+ verified lawyers across India. Instant video consultations for all legal matters.",
    url: "https://legal-booking-platform.vercel.app",
    siteName: "LegalBook",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LegalBook - Online Lawyer Booking Platform"
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LegalBook - Book Verified Lawyers Online",
    description: "Connect with 500+ verified lawyers across India",
    images: ["/twitter-image.jpg"],
    creator: "@legalbook",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics Placeholder */}
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log('GA Placeholder');`
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
