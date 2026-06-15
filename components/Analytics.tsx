import Script from "next/script";
import { readConfig } from "@/lib/affiliate-config";

// Injects GA4 and/or Plausible only when configured in the admin console. Affiliate-click events
// are pushed to window.dataLayer by AffiliateCTA — your conversion proxy.
export async function Analytics() {
  const cfg = await readConfig();
  const ga4 = cfg.analytics.ga4;
  const plausible = cfg.analytics.plausibleDomain;
  if (!ga4 && !plausible) return null;
  return (
    <>
      {ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      )}
      {plausible && (
        <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      )}
    </>
  );
}
