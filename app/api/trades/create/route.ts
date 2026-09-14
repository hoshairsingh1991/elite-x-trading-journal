import {
  createClient,
} from "@supabase/supabase-js";

import {
  createManualExecutionsAtomically,
} from "@/lib/server/trades/createManualExecutionsAtomically";

import {
  NormalizedExecution,
} from "@/types/trade";

type CreateTradeRequest = {
  executions:
    NormalizedExecution[];
};

export async function POST(
  request: Request
) {
  try {

    const authHeader =
      request.headers.get(
        "authorization"
      );

    if (!authHeader) {

      return Response.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    const supabase =
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
      error,
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      error ||
      !user
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json() as
        CreateTradeRequest;

    if (
      !body ||
      !Array.isArray(
        body.executions
      )
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Invalid create request.",
        },
        {
          status: 400,
        }
      );
    }

    const insertedCount =
      await createManualExecutionsAtomically(
        body.executions,
        user.id
      );

    return Response.json({
      success: true,
      insertedCount,
    });

  } catch (error) {

    console.error(
      "MANUAL TRADE CREATE FAILED:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to create manual trade.",
      },
      {
        status: 500,
      }
    );
  }
}