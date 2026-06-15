import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { DisclosureBanner } from "@/components/DisclosureBanner";
import { Analytics } from "@/components/Analytics";

export const metadata: Metadata = {
  title: {
    default: "Curated — looks & kits worth wearing",
    template: "%s · Curated",
  },
  description:
    "A personalized, editorial feed of complete looks and kits. Describe what you need and watch a coherent look assemble — every piece shoppable.",
  openGraph: {
    title: "Curated",
    description: "Editorial looks & kits, assembled by a real coherence engine.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <DisclosureBanner />
        <Analytics />
      </body>
    </html>
  );
}
