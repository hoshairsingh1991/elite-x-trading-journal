export interface VendorIconResolverInput {
  vendor: string;
}

export interface VendorIconResolution {
  src: string;
  alt: string;
  fallbackText: string;
}

/*
 * Logo.dev Publishable Key
 *
 * This is intentionally the same browser-safe key used by AssetIcon.
 */
const LOGO_DEV_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

/*
 * Explicit vendor → domain mapping.
 *
 * Keep this list small and controlled.
 * We do NOT perform a search request for every renewal row.
 */
const VENDOR_LOGO_DOMAINS: Record<string, string> = {
  tradingview: "chart-tradingview.ai",
  bookmap: "bookmap.com",
  rithmic: "rithmic.com",
  cqg: "cqg.com",
  ibkr: "interactivebrokers.com",
  "interactive brokers": "interactivebrokers.com",
  ninjatrader: "ninjatrader.com",
  edgeful: "edgeful.com",
  tradezella: "tradezella.com",
  udemy: "udemy.com",
};

function normalizeVendor(vendor: string) {
  return vendor
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getFallbackText(vendor: string) {
  const normalizedVendor = vendor.trim();

  if (!normalizedVendor) {
    return "?";
  }

  return normalizedVendor
    .charAt(0)
    .toUpperCase();
}

function buildCompanyLogoUrl(domain: string) {
  if (!LOGO_DEV_PUBLISHABLE_KEY) {
    return null;
  }

return `https://img.logo.dev/${encodeURIComponent(
  domain
)}?token=${encodeURIComponent(
  LOGO_DEV_PUBLISHABLE_KEY
)}&size=40&theme=light`;
}

export function resolveVendorIcon(
  input: VendorIconResolverInput
): VendorIconResolution | null {
  const vendor = input.vendor?.trim();

  if (!vendor) {
    return null;
  }

  const normalizedVendor =
    normalizeVendor(vendor);

  const domain =
    VENDOR_LOGO_DOMAINS[normalizedVendor]

  if (!domain) {
    return {
      src: "",
      alt: `${vendor} logo`,
      fallbackText:
        getFallbackText(vendor),
    };
  }

  const src =
    buildCompanyLogoUrl(domain);

  if (!src) {
    return {
      src: "",
      alt: `${vendor} logo`,
      fallbackText:
        getFallbackText(vendor),
    };
  }

  return {
    src,
    alt: `${vendor} logo`,
    fallbackText:
      getFallbackText(vendor),
  };
}