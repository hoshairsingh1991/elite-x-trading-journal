// ================================================================
// ELITE X — ASSET ICON RESOLVER
// ================================================================
//
// Presentation/reference-data layer only.
//
// Responsibilities:
// - Resolve the best available external logo URL.
// - Keep provider-specific URL construction out of UI components.
// - Never modify canonical Trade data.
// - Return null when no provider resolution is appropriate.
//
// ================================================================

export interface AssetIconResolverInput {
  ticker: string;
  assetType?: string;
  contractKey?: string;
  exchange?: string;
}

export interface AssetIconResolution {
  src: string;
  alt: string;
  fallbackText: string;
}

const LOGO_DEV_PUBLISHABLE_KEY =
  process.env
    .NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

function normalizeAssetType(
  assetType?: string
) {
  return (
    assetType
      ?.trim()
      .toLowerCase()
      .replace(/[_\s-]+/g, "")
  );
}

function normalizeExchange(
  exchange?: string
) {
  return exchange
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

const STOCK_TICKER_SUFFIX_BY_EXCHANGE: Record<
  string,
  string
> = {
  TSE: ".TO",
  TSX: ".TO",
  XTSE: ".TO",
  TORONTOSTOCKEXCHANGE: ".TO",
};

function resolveProviderTicker(
  ticker: string,
  exchange?: string
) {
  const normalizedTicker = ticker.trim();
  const normalizedExchange =
    normalizeExchange(exchange);

  const suffix =
    normalizedExchange
      ? STOCK_TICKER_SUFFIX_BY_EXCHANGE[
          normalizedExchange
        ]
      : undefined;

  if (
    !suffix ||
    normalizedTicker
      .toUpperCase()
      .endsWith(suffix)
  ) {
    return normalizedTicker;
  }

  return `${normalizedTicker}${suffix}`;
}

function getFallbackText(
  ticker: string
) {
  const normalizedTicker =
    ticker.trim();

  if (!normalizedTicker) {
    return "?";
  }

  return normalizedTicker
    .charAt(0)
    .toUpperCase();
}

function buildStockLogoUrl(
  ticker: string
) {
  if (
    !LOGO_DEV_PUBLISHABLE_KEY
  ) {
    return null;
  }

  const encodedTicker =
    encodeURIComponent(
      ticker.trim()
    );

  return (
    `https://img.logo.dev/ticker/` +
    `${encodedTicker}?token=` +
    `${encodeURIComponent(
      LOGO_DEV_PUBLISHABLE_KEY
    )}&size=40`
  );
}

function buildCryptoLogoUrl(
  ticker: string
) {
  if (
    !LOGO_DEV_PUBLISHABLE_KEY
  ) {
    return null;
  }

  const encodedTicker =
    encodeURIComponent(
      ticker.trim()
    );

  return (
    `https://img.logo.dev/crypto/` +
    `${encodedTicker}?token=` +
    `${encodeURIComponent(
      LOGO_DEV_PUBLISHABLE_KEY
    )}&size=40`
  );
}

export function resolveAssetIcon(
  input: AssetIconResolverInput
): AssetIconResolution | null {
  const ticker =
    input.ticker?.trim();

  if (!ticker) {
    return null;
  }

  const assetType =
    normalizeAssetType(
      input.assetType
    );

  const fallbackText =
    getFallbackText(
      ticker
    );

  // ------------------------------------------------
  // CRYPTO
  // ------------------------------------------------

  if (
    assetType === "crypto" ||
    assetType === "cryptocurrency"
  ) {
    const src =
      buildCryptoLogoUrl(
        ticker
      );

    if (!src) {
      return null;
    }

    return {
      src,
      alt: `${ticker} logo`,
      fallbackText,
    };
  }

  // ------------------------------------------------
  // STOCKS / ETF / FUNDS / REITS
  //
  // Options intentionally resolve using their
  // underlying ticker, which Trade already provides.
  // ------------------------------------------------

  const isStockLike =
    !assetType ||
    assetType === "stock" ||
    assetType === "stocks" ||
    assetType === "equity" ||
    assetType === "etf" ||
    assetType === "fund" ||
    assetType === "funds" ||
    assetType === "reit" ||
    assetType === "reits" ||
    assetType === "options";

if (isStockLike) {
  const providerTicker =
    resolveProviderTicker(
      ticker,
      input.exchange
    );

  const src =
    buildStockLogoUrl(
      providerTicker
    );

    if (!src) {
      return null;
    }

    return {
      src,
      alt: `${ticker} logo`,
      fallbackText,
    };
  }

  // ------------------------------------------------
  // FUTURES / FOREX / CFD / UNKNOWN
  //
  // Do not blindly send unsupported instruments
  // to the stock endpoint.
  //
  // These will use the deterministic UI fallback
  // until we intentionally add resolver coverage.
  // ------------------------------------------------

  return null;
}