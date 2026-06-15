// affiliate-config.ts — SERVER-ONLY. Reads/writes data/affiliate-config.json (+ offer overrides),
// the single source of truth the admin console edits. The offer resolver consumes this to wrap
// outbound URLs with your real network IDs. Falls back to env vars, then to the seed URLs.
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import configDefault from "@/data/affiliate-config.json";

const CONFIG_PATH = path.join(process.cwd(), "data", "affiliate-config.json");
const OVERRIDES_PATH = path.join(process.cwd(), "data", "offer-overrides.json");

// Vercel's serverless filesystem is read-only — detect it so writes fail with a clear message.
function isReadOnly(e: any): boolean {
  return e && (e.code === "EROFS" || e.code === "EACCES" || e.code === "EPERM");
}
const READONLY_MSG =
  "This deployment has a read-only filesystem. Set affiliate IDs as Vercel env vars " +
  "(SOVRN_PUBLISHER_ID, AMAZON_ASSOC_TAG, NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_SITE_URL), or edit " +
  "data/*.json locally and push to redeploy.";

// Overlay env vars onto a config object (production source of truth). Pure — also used by data.ts.
export function applyEnvOverlay(cfg: AffiliateConfig): AffiliateConfig {
  const next: AffiliateConfig = JSON.parse(JSON.stringify(cfg));
  const s = next.networks?.sovrn;
  if (s && !s.publisherId && process.env.SOVRN_PUBLISHER_ID) { s.publisherId = process.env.SOVRN_PUBLISHER_ID; s.enabled = true; }
  const a = next.networks?.amazon;
  if (a && !a.associateTag && process.env.AMAZON_ASSOC_TAG) { a.associateTag = process.env.AMAZON_ASSOC_TAG; a.enabled = true; }
  if (next.analytics) {
    if (!next.analytics.ga4 && process.env.NEXT_PUBLIC_GA4_ID) next.analytics.ga4 = process.env.NEXT_PUBLIC_GA4_ID;
    if (!next.analytics.plausibleDomain && process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) next.analytics.plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  }
  if (next.site && !next.site.url && process.env.NEXT_PUBLIC_SITE_URL) next.site.url = process.env.NEXT_PUBLIC_SITE_URL;
  return next;
}

export interface NetworkConfig {
  enabled: boolean;
  label: string;
  note: string;
  publisherId?: string;
  associateTag?: string;
  paapiAccessKey?: string;
  paapiSecret?: string;
  region?: string;
  affiliateId?: string;
  websiteId?: string;
  accountSid?: string;
}

export interface AffiliateConfig {
  site: { name: string; url: string };
  networks: Record<string, NetworkConfig>;
  analytics: { ga4: string; plausibleDomain: string };
  updatedAt: string | null;
}

// Per-product offer override the admin can set (force a network, paste a direct URL, mark dead).
export interface OfferOverride {
  network?: string;
  affiliateUrl?: string;
  merchant?: string;
  status?: "active" | "stale" | "dead";
  inStock?: boolean;
}

export async function readConfig(): Promise<AffiliateConfig> {
  // prefer the on-disk file (live local edits); fall back to the bundled default (serverless).
  let cfg: AffiliateConfig;
  try {
    cfg = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8")) as AffiliateConfig;
  } catch {
    cfg = configDefault as unknown as AffiliateConfig;
  }
  return applyEnvOverlay(cfg);
}

export async function writeConfig(cfg: AffiliateConfig): Promise<void> {
  cfg.updatedAt = new Date().toISOString();
  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  } catch (e) {
    if (isReadOnly(e)) throw new Error(READONLY_MSG);
    throw e;
  }
}

export async function readOverrides(): Promise<Record<string, OfferOverride>> {
  try {
    return JSON.parse(await fs.readFile(OVERRIDES_PATH, "utf8"));
  } catch {
    return {};
  }
}

export async function writeOverrides(o: Record<string, OfferOverride>): Promise<void> {
  try {
    await fs.writeFile(OVERRIDES_PATH, JSON.stringify(o, null, 2));
  } catch (e) {
    if (isReadOnly(e)) throw new Error(READONLY_MSG);
    throw e;
  }
}

// Which networks are "live" (enabled + have an ID).
export function liveNetworks(cfg: AffiliateConfig): string[] {
  return Object.entries(cfg.networks)
    .filter(([k, n]) => n.enabled && hasId(k, n))
    .map(([k]) => k);
}

export function hasId(key: string, n: NetworkConfig): boolean {
  switch (key) {
    case "sovrn": return !!n.publisherId;
    case "amazon": return !!n.associateTag;
    case "shareasale": return !!n.affiliateId;
    case "cj": return !!n.websiteId;
    case "impact": return !!n.accountSid;
    default: return false;
  }
}
