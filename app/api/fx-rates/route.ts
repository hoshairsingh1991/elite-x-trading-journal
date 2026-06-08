import { NextResponse } from "next/server";

import {
  FALLBACK_RATES,
} from "@/lib/fx/fxRateProvider";

// =================================================
// FX RATES API
// =================================================

export async function GET() {

  try {

    const response =
      await fetch(
        "https://api.frankfurter.app/latest?from=USD&to=CAD,EUR,GBP,JPY,INR",
        {
          cache: "no-store",
        }
      );

    if (!response.ok) {

      throw new Error(
        "Failed to fetch FX rates"
      );
    }

    const data =
      await response.json();

    const rates = {
      USD: 1,

      CAD:
        1 / data.rates.CAD,

      EUR:
        1 / data.rates.EUR,

      GBP:
        1 / data.rates.GBP,

      JPY:
        1 / data.rates.JPY,

      INR:
        1 / data.rates.INR,
    };

    return NextResponse.json(
      rates
    );

  } catch (error) {

    console.error(
      "FX API ERROR:",
      error
    );

    return NextResponse.json(
      FALLBACK_RATES
    );
  }
}