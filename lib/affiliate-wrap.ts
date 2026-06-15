// affiliate-wrap.ts — pure URL wrapping for each network's documented link format. Given a
// destination URL + the resolved network + your config IDs, produce the compliant outbound URL.
// No IDs configured → returns the original URL unchanged (zero-key demo still works).
import type { AffiliateConfig } from "./affiliate-config";

export function wrapAffiliate(targetUrl: string, network: string, cfg: AffiliateConfig): string {
  const enc = encodeURIComponent(targetUrl);
  const n = cfg.networks[network];
  if (!n || !n.enabled) return targetUrl;

  switch (network) {
    case "sovrn": {
      // Sovrn Commerce / VigLink redirect format
      if (!n.publisherId) return targetUrl;
      return `https://redirect.viglink.com/?format=go&key=${encodeURIComponent(n.publisherId)}&u=${enc}`;
    }
    case "amazon": {
      // append associate tag to the Amazon product URL (PA-API supplies links/prices once granted)
      if (!n.associateTag) return targetUrl;
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}tag=${encodeURIComponent(n.associateTag)}`;
    }
    case "shareasale": {
      if (!n.affiliateId) return targetUrl;
      return `https://www.shareasale.com/r.cfm?u=${encodeURIComponent(n.affiliateId)}&urllink=${enc}`;
    }
    case "cj": {
      if (!n.websiteId) return targetUrl;
      return `https://www.anrdoezrs.net/links/${encodeURIComponent(n.websiteId)}/type/dlg/${enc}`;
    }
    case "impact": {
      if (!n.accountSid) return targetUrl;
      return `https://imp.i${encodeURIComponent(n.accountSid)}.net/c/?u=${enc}`;
    }
    default:
      return targetUrl;
  }
}

// Human-readable preview of what an ID change will produce (used in the admin link manager).
export function describeWrap(network: string, cfg: AffiliateConfig): string {
  const n = cfg.networks[network];
  if (!n) return "Unknown network";
  switch (network) {
    case "sovrn": return n.publisherId ? `Wrapped via Sovrn (key ${n.publisherId})` : "Not configured — links pass through unwrapped";
    case "amazon": return n.associateTag ? `?tag=${n.associateTag} appended` : "No associate tag — Amazon links un-tagged";
    case "shareasale": return n.affiliateId ? `Wrapped via ShareASale (u=${n.affiliateId})` : "No affiliate ID set";
    case "cj": return n.websiteId ? `Wrapped via CJ (website ${n.websiteId})` : "No website ID set";
    case "impact": return n.accountSid ? `Wrapped via Impact (sid ${n.accountSid})` : "No account SID set";
    default: return "—";
  }
}
