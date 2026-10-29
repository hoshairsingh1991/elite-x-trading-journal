import "server-only";
/**
 * Elite X — OpenFIGI Instrument Name Resolver
 *
 * Purpose:
 * Resolve verified names for supported stocks, ETFs, and option
 * underlyings without modifying canonical trade or execution data.
 *
 * Important:
 * - This module is server-side only.
 * - Unknown exchanges are rejected rather than guessed.
 * - Ambiguous or mismatched results are never accepted.
 * - Futures, forex, crypto, and CFDs are outside the initial scope.
 * - Cache entries exist in the current server process only.
 */

export type InstrumentMarket = "CN" | "US";

export type InstrumentNameResolutionReason =
  | "invalid_ticker"
  | "unsupported_asset_type"
  | "unsupported_exchange"
  | "no_match"
  | "ambiguous_match"
  | "identity_mismatch"
  | "provider_rate_limited"
  | "provider_error"
  | "invalid_response";

export interface ResolveInstrumentNameInput {
  ticker: string;
  exchange?: string | null;
  assetType?: string | null;
}

export interface InstrumentNameResolution {
  status: "resolved" | "unresolved";
  ticker: string;
  name: string | null;
  market: InstrumentMarket | null;
  securityType: string | null;
  figi: string | null;
  reason?: InstrumentNameResolutionReason;
}

interface OpenFigiRecord {
  ticker?: unknown;
  name?: unknown;
  figi?: unknown;
  exchCode?: unknown;
  marketSector?: unknown;
  securityType?: unknown;
  securityType2?: unknown;
}

interface OpenFigiMappingJob {
  data?: unknown;
  error?: unknown;
  warning?: unknown;
}

interface CacheEntry {
  result: InstrumentNameResolution;
  expiresAt: number;
}

const OPENFIGI_MAPPING_URL =
  "https://api.openfigi.com/v3/mapping";

const SUCCESS_CACHE_TTL_MS =
  24 * 60 * 60 * 1000;

const UNRESOLVED_CACHE_TTL_MS =
  5 * 60 * 1000;

const PROVIDER_FAILURE_CACHE_TTL_MS =
  30 * 1000;

const RATE_LIMIT_CACHE_TTL_MS =
  60 * 1000;

const MAX_CACHE_ENTRIES = 500;

const cache =
  new Map<string, CacheEntry>();

const pendingLookups =
  new Map<
    string,
    Promise<InstrumentNameResolution>
  >();

const SUPPORTED_ASSET_TYPES =
  new Set([
    "STOCK",
    "STOCKS",
    "ETF",
    "ETFS",
    "OPTIONS",
  ]);

const CANADIAN_EXCHANGES =
  new Set([
    "TSE",
    "TSX",
    "XTSE",
    "TORONTO STOCK EXCHANGE",
    "TSXV",
    "XTSX",
    "TSX VENTURE",
    "TSX VENTURE EXCHANGE",
    "TORONTO VENTURE EXCHANGE",
  ]);

const US_EXCHANGES =
  new Set([
    "NYSE",
    "NEW YORK STOCK EXCHANGE",
    "NASDAQ",
    "NASDAQ NMS",
    "NASDAQ NCM",
    "NASDAQ GM",
    "NASDAQ GS",
    "NASDAQ GLOBAL SELECT MARKET",
    "NASDAQ GLOBAL MARKET",
    "NASDAQ CAPITAL MARKET",
    "NYSE ARCA",
    "NYSEARCA",
    "ARCA",
    "AMEX",
    "NYSE AMERICAN",
    "NMS",
    "NGS",
    "NGM",
    "NCM",
  ]);

const ALLOWED_MARKET_SECTORS =
  new Set([
    "EQUITY",
    "FUND",
    "FUNDS",
  ]);

const ALLOWED_SECURITY_TYPES =
  new Set([
    "COMMON STOCK",
    "DEPOSITARY RECEIPT",
    "DEPOSITARY SHARES",
    "AMERICAN DEPOSITARY RECEIPT",
    "PREFERRED STOCK",
    "ETP",
    "ETF",
    "MUTUAL FUND",
    "REIT",
    "EXCHANGE TRADED PRODUCT",
  ]);

function normalizeExchange(
  exchange?: string | null
): string {
  return (exchange ?? "")
    .trim()
    .toUpperCase()
    .replace(/[_.-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeAssetType(
  assetType?: string | null
): string {
  return (assetType ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function normalizeInputTicker(
  ticker: string
): string {
  return ticker.trim().toUpperCase();
}

/**
 * OpenFIGI represents some share-class tickers with a slash.
 * Convert only the common single-letter class format, e.g. BRK.B.
 */
function normalizeLookupTicker(
  ticker: string
): string {
  if (/^[A-Z0-9]+\.[A-Z]$/.test(ticker)) {
    return ticker.replace(".", "/");
  }

  return ticker;
}

function resolveMarket(
  exchange?: string | null
): InstrumentMarket | null {
  const normalized =
    normalizeExchange(exchange);

  if (CANADIAN_EXCHANGES.has(normalized)) {
    return "CN";
  }

  if (US_EXCHANGES.has(normalized)) {
    return "US";
  }

  // Deliberately do not guess from SMART, unknown, or blank values.
  return null;
}

function isValidTicker(
  ticker: string
): boolean {
  return /^[A-Z0-9][A-Z0-9./-]{0,14}$/.test(
    ticker
  );
}

function readString(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeField(
  value: unknown
): string {
  return readString(value).toUpperCase();
}

function unresolved(
  ticker: string,
  market: InstrumentMarket | null,
  reason: InstrumentNameResolutionReason
): InstrumentNameResolution {
  return {
    status: "unresolved",
    ticker,
    name: null,
    market,
    securityType: null,
    figi: null,
    reason,
  };
}

function makeCacheKey(
  ticker: string,
  market: InstrumentMarket
): string {
  return `${market}:${ticker}`;
}

function readCache(
  key: string
): InstrumentNameResolution | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  // Return a copy so a caller cannot mutate the cached result.
  return { ...entry.result };
}

function writeCache(
  key: string,
  result: InstrumentNameResolution
): void {
  let ttl = UNRESOLVED_CACHE_TTL_MS;

  if (result.status === "resolved") {
    ttl = SUCCESS_CACHE_TTL_MS;
  } else if (
    result.reason === "provider_error" ||
    result.reason === "invalid_response"
  ) {
    ttl = PROVIDER_FAILURE_CACHE_TTL_MS;
  } else if (
    result.reason === "provider_rate_limited"
  ) {
    ttl = RATE_LIMIT_CACHE_TTL_MS;
  }

  cache.delete(key);

  // Keep the in-memory cache bounded.
  while (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey =
      cache.keys().next().value;

    if (oldestKey === undefined) {
      break;
    }

    cache.delete(oldestKey);
  }

  cache.set(key, {
    result: { ...result },
    expiresAt: Date.now() + ttl,
  });
}

function isOpenFigiRecord(
  value: unknown
): value is OpenFigiRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isSupportedInstrument(
  record: OpenFigiRecord
): boolean {
  const marketSector =
    normalizeField(record.marketSector);

  const securityType =
    normalizeField(record.securityType);

  const securityType2 =
    normalizeField(record.securityType2);

  const sectorIsAllowed =
    ALLOWED_MARKET_SECTORS.has(
      marketSector
    );

  const typeIsAllowed =
    ALLOWED_SECURITY_TYPES.has(
      securityType
    ) ||
    ALLOWED_SECURITY_TYPES.has(
      securityType2
    );

  return sectorIsAllowed && typeIsAllowed;
}

async function requestOpenFigi(
  ticker: string,
  market: InstrumentMarket
): Promise<InstrumentNameResolution> {
  const unresolvedResult = (
    reason: InstrumentNameResolutionReason
  ) => unresolved(ticker, market, reason);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const apiKey =
    process.env.OPENFIGI_API_KEY?.trim();

  if (apiKey) {
    headers["X-OPENFIGI-APIKEY"] = apiKey;
  }

  let response: Response;

  try {
    response = await fetch(
      OPENFIGI_MAPPING_URL,
      {
        method: "POST",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify([
          {
            idType: "TICKER",
            idValue: ticker,
            exchCode: market,
          },
        ]),
      }
    );
  } catch {
    return unresolvedResult("provider_error");
  }

  if (response.status === 429) {
    return unresolvedResult(
      "provider_rate_limited"
    );
  }

  if (!response.ok) {
    return unresolvedResult("provider_error");
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return unresolvedResult("invalid_response");
  }

  if (
    !Array.isArray(payload) ||
    payload.length !== 1 ||
    typeof payload[0] !== "object" ||
    payload[0] === null
  ) {
    return unresolvedResult("invalid_response");
  }

  const job =
    payload[0] as OpenFigiMappingJob;

  if (!Array.isArray(job.data)) {
    return unresolvedResult("no_match");
  }

  const records =
    job.data.filter(isOpenFigiRecord);

  if (records.length === 0) {
    return unresolvedResult("no_match");
  }

  // First require an exact normalized ticker and market match.
  const tickerAndMarketMatches =
    records.filter((record) => {
      const returnedTicker =
        readString(record.ticker);

      const returnedMarket =
        normalizeField(record.exchCode);

      return (
        normalizeLookupTicker(
          returnedTicker.toUpperCase()
        ) === ticker &&
        returnedMarket === market
      );
    });

  if (tickerAndMarketMatches.length === 0) {
    return unresolvedResult(
      "identity_mismatch"
    );
  }

  // Reject unsupported sectors and security types.
  const acceptableMatches =
    tickerAndMarketMatches.filter(
      isSupportedInstrument
    );

  if (acceptableMatches.length === 0) {
    return unresolvedResult(
      "identity_mismatch"
    );
  }

  // Never select arbitrarily from multiple acceptable results.
  if (acceptableMatches.length !== 1) {
    return unresolvedResult(
      "ambiguous_match"
    );
  }

  const match =
    acceptableMatches[0];

  const name =
    readString(match.name);

  const figi =
    readString(match.figi);

  const securityType =
    readString(match.securityType) ||
    readString(match.securityType2);

  if (!name || !figi || !securityType) {
    return unresolvedResult(
      "identity_mismatch"
    );
  }

  return {
    status: "resolved",
    ticker,
    name,
    market,
    securityType,
    figi,
  };
}

/**
 * Resolve a verified display name for a supported instrument.
 *
 * Unsupported asset types and exchanges return an unresolved
 * result without contacting OpenFIGI.
 */
export async function resolveInstrumentName(
  input: ResolveInstrumentNameInput
): Promise<InstrumentNameResolution> {
  const inputTicker =
    normalizeInputTicker(input.ticker ?? "");

  if (
    !inputTicker ||
    !isValidTicker(inputTicker)
  ) {
    return unresolved(
      inputTicker,
      null,
      "invalid_ticker"
    );
  }

  const assetType =
    normalizeAssetType(input.assetType);

  if (!SUPPORTED_ASSET_TYPES.has(assetType)) {
    return unresolved(
      inputTicker,
      null,
      "unsupported_asset_type"
    );
  }

  const market =
    resolveMarket(input.exchange);

  if (!market) {
    return unresolved(
      inputTicker,
      null,
      "unsupported_exchange"
    );
  }

  const lookupTicker =
    normalizeLookupTicker(inputTicker);

  const cacheKey =
    makeCacheKey(lookupTicker, market);

  const cached =
    readCache(cacheKey);

  if (cached) {
    return {
      ...cached,
      ticker: inputTicker,
    };
  }

  const pending =
    pendingLookups.get(cacheKey);

  if (pending) {
    const result = await pending;

    return {
      ...result,
      ticker: inputTicker,
    };
  }

  const lookup =
    requestOpenFigi(lookupTicker, market);

  pendingLookups.set(cacheKey, lookup);

  try {
    const result = await lookup;

    writeCache(cacheKey, result);

    return {
      ...result,
      ticker: inputTicker,
    };
  } finally {
    if (
      pendingLookups.get(cacheKey) === lookup
    ) {
      pendingLookups.delete(cacheKey);
    }
  }
}
