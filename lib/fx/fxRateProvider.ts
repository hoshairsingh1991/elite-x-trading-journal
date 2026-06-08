// =================================================
// FX RATE PROVIDER
// =================================================

export type FxRates = {
  USD: number;
  CAD: number;
  EUR: number;
  GBP: number;
  JPY: number;
  INR: number;
};

export const FALLBACK_RATES: FxRates = {
  USD: 1,
  CAD: 0.73,
  EUR: 1.14,
  GBP: 1.34,
  JPY: 0.0068,
  INR: 0.012,
};

// =================================================
// CACHE CONFIG
// =================================================

const CACHE_KEY =
  "elitex_fx_rates";

const CACHE_DURATION =
  12 * 60 * 60 * 1000; // 12 hours

// =================================================
// GET FX RATES
// =================================================

export async function getFxRates(): Promise<FxRates> {

  try {

    // =============================================
    // CACHE CHECK
    // =============================================

    const cached =
      localStorage.getItem(
        CACHE_KEY
      );

    if (cached) {

      const parsed =
        JSON.parse(cached);

      const age =
        Date.now() -
        parsed.timestamp;

      if (
        age <
        CACHE_DURATION
      ) {

        return parsed.rates;
      }
    }

    // =============================================
    // FETCH LIVE RATES
    // =============================================

    const response =
      await fetch(
        "/api/fx-rates"
      );

    if (!response.ok) {

      throw new Error(
        "Failed to fetch FX rates"
      );
    }

    // =============================================
    // API ROUTE ALREADY RETURNS
    // NORMALIZED ELITE X RATES
    // =============================================

    const rates: FxRates =
      await response.json();

    // =============================================
    // SAVE CACHE
    // =============================================

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        rates,
      })
    );

    return rates;

  } catch (error) {

    console.error(
      "FX RATE FETCH FAILED:",
      error
    );

    // =============================================
    // CACHE FALLBACK
    // =============================================

    const cached =
      localStorage.getItem(
        CACHE_KEY
      );

    if (cached) {

      try {

        const parsed =
          JSON.parse(cached);

        return parsed.rates;

      } catch {
        // continue
      }
    }

    // =============================================
    // STATIC FALLBACK
    // =============================================

    return FALLBACK_RATES;
  }
}