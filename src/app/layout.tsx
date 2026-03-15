// src/app/layout.tsx
import type { Metadata } from "next";
import {
  Bebas_Neue,
  Libre_Baskerville,
  Oswald,
  IBM_Plex_Mono,
} from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const oswald = Oswald({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Black Male Journal",
    template: "%s | The Black Male Journal",
  },
  description:
    "Independent media house and revolutionary masculinist platform covering health, philosophy, and politics for Black men.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = [
    bebasNeue.variable,
    libreBaskerville.variable,
    oswald.variable,
    ibmPlexMono.variable,
  ].join(" ");

  return (
    <html lang="en" className={fontVars}>
      <body className="grain flex min-h-screen flex-col bg-bmj-black text-bmj-cream">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* Plausible analytics — uncomment when domain is live */}
        {/* <Script
          defer
          data-domain="blackmalejournal.com"
          src="https://plausible.io/js/plausible.js"
        /> */}
      </body>
    </html>
  );
}
