import type { Metadata } from "next";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { TourProvider } from "@/components/ui";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cortex – Backend as a service for AI agents",
  description: "A neural-inspired runtime where intelligent agents connect, evolve, and collaborate.",
  icons: {
    icon: '/download.png',
    shortcut: '/download.png',
    apple: '/download.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ClerkProvider>
    <html lang="en">
      <head>
        <script async defer src="https://buttons.github.io/buttons.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TourProvider>
        {children}
        </TourProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
