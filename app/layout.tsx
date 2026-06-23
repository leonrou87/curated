import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { DisclosureBanner } from "@/components/DisclosureBanner";
import { Analytics } from "@/components/Analytics";
import { CookieNotice } from "@/components/CookieNotice";
import { BackToTop } from "@/components/BackToTop";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://curated.kytepush.com";
const OG_DEFAULT = "/og?type=look&t=A%20Magazine%20You%20Can%20Shop&a=old-money";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Curated — a magazine you can shop",
    template: "%s · Curated",
  },
  description:
    "An editorial feed of complete looks — real outfits from real brands, ready to wear and ready to shop. Search by occasion or aesthetic, or take the style quiz.",
  applicationName: "Curated",
  keywords: ["outfit ideas", "complete looks", "shop the look", "style quiz", "aesthetic", "fashion editorial", "what to wear"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Curated — a magazine you can shop",
    description: "Complete looks, real pieces, every aesthetic. Editorial outfits you can shop in a tap.",
    type: "website",
    siteName: "Curated",
    url: SITE,
    images: [{ url: OG_DEFAULT, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Curated — a magazine you can shop", description: "Complete looks, real pieces, every aesthetic.", images: [OG_DEFAULT] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#100f0d" },
    { media: "(prefers-color-scheme: light)", color: "#f3ece0" },
  ],
  colorScheme: "dark light",
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE}/#org`, name: "Curated", url: SITE, logo: `${SITE}/icon-512.png` },
    { "@type": "WebSite", "@id": `${SITE}/#website`, name: "Curated", url: SITE, publisher: { "@id": `${SITE}/#org` },
      potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE}/search?q={query}` }, "query-input": "required name=query" } },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <DisclosureBanner />
        <BackToTop />
        <CookieNotice />
        <Analytics />
              <script defer src="https://kytepush.com/track.js"></script>
      </body>
    </html>
  );
}
