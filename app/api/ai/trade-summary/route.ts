import {
  createClient,
} from "@supabase/supabase-js";

import {
  GoogleGenAI,
  ThinkingLevel,
} from "@google/genai";

import {
  z,
} from "zod";

import {
  buildTradeIntelligenceInput,
} from "@/lib/ai/tradeIntelligence/buildInput";

import {
  loadCanonicalTrade,
} from "@/lib/ai/tradeIntelligence/loadCanonicalTrade";

import {
  loadTradeIntelligenceReview,
} from "@/lib/ai/tradeIntelligence/loadTradeReview";

import {
  buildTradeIntelligenceUserPrompt,
  TRADE_INTELLIGENCE_SYSTEM_PROMPT,
} from "@/lib/ai/tradeIntelligence/prompt";

import {
  tradeIntelligenceInternalSchema,
} from "@/lib/ai/tradeIntelligence/schema";

import type {
  TradeIntelligenceResult,
} from "@/lib/ai/tradeIntelligence/types";

import {
  TRADE_INTELLIGENCE_PROMPT_VERSION,
  TRADE_INTELLIGENCE_VERSION,
} from "@/lib/ai/tradeIntelligence/buildInput";

// =====================================================
// ROUTE CONFIG
// =====================================================

export const runtime = "nodejs";

// =====================================================
// REQUEST SCHEMA
// =====================================================
//
// The browser is allowed to provide only execution IDs.
//
// It is NOT allowed to provide canonical financial facts.
//
// =====================================================

const tradeIntelligenceRequestSchema =
  z.object({
    entryExecutionId:
      z.string().trim().min(1).max(200),

    exitExecutionId:
      z.string().trim().min(1).max(200),
  });

// =====================================================
// GEMINI CLIENT
// =====================================================

function getGeminiClient(): GoogleGenAI {

  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

// =====================================================
// GEMINI TRANSIENT RETRY
// =====================================================
//
// Gemini can temporarily return 503/429 responses because
// of backend capacity or rate limits.
//
// Retry only those transient failures.
// All other errors are allowed to fail immediately.
// =====================================================

async function generateGeminiContentWithRetry(
  gemini: GoogleGenAI,
  request: Parameters<
    GoogleGenAI["models"]["generateContent"]
  >[0],
  maxAttempts = 3
) {
  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      return await gemini.models.generateContent(
        request
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

const isDailyQuotaExceeded =
  message.includes(
    "GenerateRequestsPerDayPerProjectPerModel-FreeTier"
  );

const isTransient =
  !isDailyQuotaExceeded &&
  (
    message.includes(
      '"code":503'
    ) ||
    message.includes(
      '"code":429'
    ) ||
    message.includes(
      "UNAVAILABLE"
    ) ||
    message.includes(
      "RESOURCE_EXHAUSTED"
    )
  );

      if (
        !isTransient ||
        attempt === maxAttempts
      ) {
        throw error;
      }

      const delayMs =
        1000 *
        2 ** (attempt - 1);

      console.warn(
        `TRADE INTELLIGENCE GEMINI TRANSIENT ERROR. RETRYING IN ${delayMs}ms.`,
        {
          attempt,
          maxAttempts,
        }
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            delayMs
          )
      );
    }
  }

  throw new Error(
    "Gemini generation failed after retries."
  );
}

// =====================================================
// EVIDENCE REFERENCE VALIDATION
// =====================================================
//
// Structured Outputs guarantees the shape of the response.
//
// It does NOT guarantee that an evidence reference actually
// exists in the supplied Trade Intelligence input.
//
// We therefore validate evidence references ourselves before
// allowing the result to reach the client.
// =====================================================

function buildAllowedEvidenceRefs(
  input: ReturnType<
    typeof buildTradeIntelligenceInput
  >
): Set<string> {

  const refs = new Set<string>([
    "trade.id",
    "trade.ticker",
    "trade.contract",
    "trade.contractKey",
    "trade.side",
    "trade.status",
    "trade.date",
    "trade.strategy",
    "trade.setup",
    "trade.session",
    "trade.assetType",
    "trade.account",
    "trade.quantity",
    "trade.entryPrice",
    "trade.exitPrice",
    "trade.openedAt",
    "trade.closedAt",
    "trade.currency",
    "trade.feeCurrency",
    "trade.isOpen",

    "derivedFacts.holdDurationSeconds",
    "derivedFacts.holdingDays",
    "derivedFacts.realizedPnl",
    "derivedFacts.grossPnl",
    "derivedFacts.fees",
    "derivedFacts.pnlPercent",
    "derivedFacts.entryNotional",
    "derivedFacts.exitNotional",
    "derivedFacts.executionCount",
    "derivedFacts.entryExecutionCount",
    "derivedFacts.exitExecutionCount",
    "derivedFacts.partialEntry",
    "derivedFacts.partialExit",

    "executions.entry.id",
    "executions.entry.executionTimestamp",
    "executions.entry.date",
    "executions.entry.ticker",
    "executions.entry.contract",
    "executions.entry.contractKey",
    "executions.entry.action",
    "executions.entry.quantity",
    "executions.entry.executionPrice",
    "executions.entry.executionValue",
    "executions.entry.fees",
    "executions.entry.currency",
    "executions.entry.feeCurrency",
    "executions.entry.account",
    "executions.entry.assetType",
    "executions.entry.multiplier",

    "executions.exit.id",
    "executions.exit.executionTimestamp",
    "executions.exit.date",
    "executions.exit.ticker",
    "executions.exit.contract",
    "executions.exit.contractKey",
    "executions.exit.action",
    "executions.exit.quantity",
    "executions.exit.executionPrice",
    "executions.exit.executionValue",
    "executions.exit.fees",
    "executions.exit.currency",
    "executions.exit.feeCurrency",
    "executions.exit.account",
    "executions.exit.assetType",
    "executions.exit.multiplier",
  ]);

  if (input.review) {
    refs.add(
      "review.id"
    );

    refs.add(
      "review.entryExecutionId"
    );

    refs.add(
      "review.exitExecutionId"
    );

    refs.add(
      "review.tradeContext"
    );

    refs.add(
      "review.setup"
    );

    refs.add(
      "review.entryReason"
    );

    refs.add(
      "review.exitReason"
    );

    refs.add(
      "review.psychology"
    );

    refs.add(
      "review.tradeManagement"
    );

    refs.add(
      "review.mistakes"
    );

    refs.add(
      "review.strengths"
    );

    refs.add(
      "review.reviewed"
    );
  }

  return refs;
}

// =====================================================
// VALIDATE EVIDENCE REFERENCES
// =====================================================

function validateEvidenceReferences(
  input: ReturnType<
    typeof buildTradeIntelligenceInput
  >,
  parsedResult: z.infer<
    typeof tradeIntelligenceInternalSchema
  >
): void {

  const allowedRefs =
    buildAllowedEvidenceRefs(
      input
    );

  const insights = [
    parsedResult.tradeRead,
    parsedResult.whatStandsOut,
    parsedResult.executionRead,
    parsedResult.behavioralSignal,
    parsedResult.strength,
    parsedResult.weakness,
    parsedResult.keyTakeaway,
    parsedResult.xFactor,
  ];

  for (
    const insight of insights
  ) {

    if (!insight) {
      continue;
    }

    for (
      const evidenceRef of insight.evidenceRefs
    ) {

      if (
        !allowedRefs.has(
          evidenceRef
        )
      ) {
        throw new Error(
          `AI returned unsupported evidence reference: ${evidenceRef}`
        );
      }
    }
  }
}

// =====================================================
// CONVERT INTERNAL RESULT → UI RESULT
// =====================================================

function toUiResult(
  result: z.infer<
    typeof tradeIntelligenceInternalSchema
  >
): TradeIntelligenceResult {

  return {
    tradeRead:
      result.tradeRead.text,

    whatStandsOut:
      result.whatStandsOut.text,

    executionRead:
      result.executionRead.text,

    behavioralSignal:
      result.behavioralSignal?.text ??
      null,

    strength:
      result.strength?.text ??
      null,

    weakness:
      result.weakness?.text ??
      null,

    keyTakeaway:
      result.keyTakeaway.text,

    xFactor:
      result.xFactor?.text ??
      null,
  };
}

// =====================================================
// POST
// =====================================================

export async function POST(
  request: Request
) {

  try {

    // ===================================================
    // AUTHENTICATION
    // ===================================================

    const authHeader =
      request.headers.get(
        "authorization"
      );

    if (
      !authHeader
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authHeader.replace(
        /^Bearer\s+/i,
        ""
      ).trim();

    if (!token) {

      return Response.json(
        {
          success: false,
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    // ===================================================
    // USER-SCOPED SUPABASE CLIENT
    // ===================================================
    //
    // Service role is intentionally NOT used here.
    //
    // Authentication is performed with a dedicated client.
    // Database queries then use a second user-scoped client
    // carrying the same JWT so existing RLS remains part
    // of the security boundary.
    // ===================================================

    const authSupabase =
      createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

    const {
      data: {
        user,
      },
      error: authError,
    } =
      await authSupabase.auth.getUser(
        token
      );

    if (
      authError ||
      !user
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const supabase =
      createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          accessToken: async () =>
            token,

          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
        }
      );

    // ===================================================
    // REQUEST BODY
    // ===================================================

    let rawBody: unknown;

    try {

      rawBody =
        await request.json();

    } catch {

      return Response.json(
        {
          success: false,
          error:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedRequest =
      tradeIntelligenceRequestSchema.safeParse(
        rawBody
      );

    if (
      !parsedRequest.success
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Invalid Trade Intelligence request.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      entryExecutionId,
      exitExecutionId,
    } =
      parsedRequest.data;

    // ===================================================
    // LOAD AUTHORITATIVE CANONICAL TRADE
    // ===================================================

    const trade =
      await loadCanonicalTrade(
        supabase,
        user.id,
        entryExecutionId,
        exitExecutionId
      );

    // ===================================================
    // LOAD EXACT TRADE REVIEW
    // ===================================================

    const review =
      await loadTradeIntelligenceReview(
        supabase,
        user.id,
        entryExecutionId,
        exitExecutionId
      );

    // ===================================================
    // BUILD TRUSTED AI INPUT
    // ===================================================

    const intelligenceInput =
      buildTradeIntelligenceInput(
        trade,
        review
      );

    // ===================================================
    // BUILD MODEL PROMPT
    // ===================================================

    const userPrompt =
      buildTradeIntelligenceUserPrompt(
        intelligenceInput
      );

// ===================================================
// GEMINI
// ===================================================

const gemini =
  getGeminiClient();

const model =
  process.env
    .GEMINI_TRADE_INTELLIGENCE_MODEL
    ?.trim() ||
  "gemini-3.6-flash";

// ===================================================
// STRUCTURED GENERATION
// ===================================================
//
// Gemini returns JSON matching the supplied JSON schema.
// The response is then parsed and validated locally with
// the same Zod schema used by the Intelligence pipeline.
// ===================================================

const response =
  await generateGeminiContentWithRetry(
    gemini,
    {
      model,

      contents:
        userPrompt,

      config: {
        systemInstruction:
          TRADE_INTELLIGENCE_SYSTEM_PROMPT,

        responseMimeType:
          "application/json",

        responseJsonSchema:
          z.toJSONSchema(
            tradeIntelligenceInternalSchema
          ),

        thinkingConfig: {
          thinkingLevel:
            ThinkingLevel.MEDIUM,
        },

maxOutputTokens:
  4096,
      },
    }
  );

// ===================================================
// PARSED STRUCTURED OUTPUT
// ===================================================
//
// Gemini is configured for JSON structured output.
// We still normalize common transport formatting such as
// markdown code fences before parsing.
//
// Zod remains the final authority on the actual structure.
// ===================================================

const rawOutput =
  response.text?.trim();

if (!rawOutput) {

  console.error(
    "TRADE INTELLIGENCE GEMINI RETURNED NO TEXT OUTPUT."
  );

  return Response.json(
    {
      success: false,
      error:
        "Trade Intelligence returned no usable result.",
    },
    {
      status: 502,
    }
  );
}

let output: unknown;

try {

  let normalizedOutput =
    rawOutput;

  const fencedMatch =
    rawOutput.match(
      /^```(?:json)?\s*([\s\S]*?)\s*```$/i
    );

  if (fencedMatch) {
    normalizedOutput =
      fencedMatch[1].trim();
  }

  try {

    output =
      JSON.parse(
        normalizedOutput
      );

  } catch {

    const firstBrace =
      normalizedOutput.indexOf("{");

    const lastBrace =
      normalizedOutput.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      lastBrace <= firstBrace
    ) {
      throw new Error(
        "No JSON object found."
      );
    }

    output =
      JSON.parse(
        normalizedOutput.slice(
          firstBrace,
          lastBrace + 1
        )
      );
  }

} catch {

console.error(
  "TRADE INTELLIGENCE GEMINI RETURNED INVALID JSON.",
  {
    responseTextType:
      typeof rawOutput,

    responseTextLength:
      rawOutput.length,

    startsWith:
      rawOutput.slice(0, 20),

    endsWith:
      rawOutput.slice(-20),

    finishReason:
      response.candidates?.[0]?.finishReason,

    finishMessage:
      response.candidates?.[0]?.finishMessage,

    candidateTokenCount:
      response.candidates?.[0]?.tokenCount,

    candidatesTokenCount:
      response.usageMetadata
        ?.candidatesTokenCount,

    thoughtsTokenCount:
      response.usageMetadata
        ?.thoughtsTokenCount,
  }
);
  return Response.json(
    {
      success: false,
      error:
        "Trade Intelligence returned invalid structured output.",
    },
    {
      status: 502,
    }
  );
}

    // ===================================================
    // SECONDARY SERVER VALIDATION
    // ===================================================
    //
    // OpenAI's parser validates the structure.
    //
    // We validate it again locally and then validate the
    // evidence references against the exact input.
    // ===================================================

    const validatedResult =
      tradeIntelligenceInternalSchema.parse(
        output
      );

    validateEvidenceReferences(
      intelligenceInput,
      validatedResult
    );

    // ===================================================
    // UI-SAFE RESULT
    // ===================================================

    const uiResult =
      toUiResult(
        validatedResult
      );

    // ===================================================
    // CURRENT RESPONSE
    // ===================================================
    //
    // Persistence intentionally comes later once the
    // authoritative trade_reviews database schema and RLS
    // migration are inspected.
    // ===================================================

    return Response.json({
      success: true,

      intelligence:
        uiResult,

      metadata: {
        intelligenceVersion:
          TRADE_INTELLIGENCE_VERSION,

        promptVersion:
          TRADE_INTELLIGENCE_PROMPT_VERSION,

        model,
      },
    });

  } catch (error) {

    console.error(
      "TRADE INTELLIGENCE GENERATION FAILED:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to generate Trade Intelligence.",
      },
      {
        status: 500,
      }
    );
  }
}