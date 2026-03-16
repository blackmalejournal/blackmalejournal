// src/app/layout.tsx
import type { Metadata } from "next";
import {
  Bebas_Neue,
  Libre_Baskerville,
  Oswald,
  IBM_Plex_Mono,
} from "next/font/google";
import "@/styles/globals.css";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navUser = user
    ? {
        email: user.email ?? "",
        displayName: user.user_metadata?.display_name as string | undefined,
      }
    : null;

  const fontVars = [
    bebasNeue.variable,
    libreBaskerville.variable,
    oswald.variable,
    ibmPlexMono.variable,
  ].join(" ");

  return (
    <html lang="en" className={fontVars}>
      <body className="grain flex min-h-screen flex-col bg-bmj-black text-bmj-cream">
        <JsonLd data={organizationJsonLd()} />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar user={navUser} />
        <main id="main-content" className="flex-1">{children}</main>
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
