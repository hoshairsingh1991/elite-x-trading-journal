import { createClient } from "@supabase/supabase-js";

import {
  resolveInstrumentName,
} from "@/lib/instruments/openFigiResolver";

export const runtime = "nodejs";

type InstrumentNameRequest = {
  ticker?: unknown;
  exchange?: unknown;
  assetType?: unknown;
};

function errorResponse(
  error: string,
  status: number
) {
  return Response.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export async function POST(request: Request) {
  try {
    // =================================================
    // AUTHENTICATION
    // =================================================

    const authorization =
      request.headers.get("authorization");

    const tokenMatch =
      authorization?.match(/^Bearer\s+(.+)$/i);

    const token = tokenMatch?.[1]?.trim();

    if (!token) {
      return errorResponse("Unauthorized", 401);
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "INSTRUMENT NAME API: Supabase configuration is missing."
      );

      return errorResponse(
        "Instrument name service is unavailable.",
        500
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // =================================================
    // REQUEST VALIDATION
    // =================================================

    let body: InstrumentNameRequest;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "Invalid JSON request.",
        400
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return errorResponse(
        "Invalid instrument name request.",
        400
      );
    }

    if (
      typeof body.ticker !== "string" ||
      body.ticker.trim().length === 0 ||
      body.ticker.trim().length > 15
    ) {
      return errorResponse(
        "A valid ticker is required.",
        400
      );
    }

    if (
      body.exchange !== undefined &&
      body.exchange !== null &&
      (
        typeof body.exchange !== "string" ||
        body.exchange.length > 80
      )
    ) {
      return errorResponse(
        "Invalid exchange.",
        400
      );
    }

    if (
      body.assetType !== undefined &&
      body.assetType !== null &&
      (
        typeof body.assetType !== "string" ||
        body.assetType.length > 30
      )
    ) {
      return errorResponse(
        "Invalid asset type.",
        400
      );
    }

    // =================================================
    // INSTRUMENT NAME RESOLUTION
    // =================================================

    const result = await resolveInstrumentName({
      ticker: body.ticker,
      exchange:
        typeof body.exchange === "string"
          ? body.exchange
          : null,
      assetType:
        typeof body.assetType === "string"
          ? body.assetType
          : null,
    });

    // An unresolved name is a valid resolver outcome.
    // The UI must not display an unverified fallback name.
    return Response.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "INSTRUMENT NAME API FAILED:",
      error
    );

    return errorResponse(
      "Unable to resolve the instrument name.",
      500
    );
  }
}
