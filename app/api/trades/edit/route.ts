import {
  createClient,
} from "@supabase/supabase-js";

import {
  replaceManualExecutionsAtomically,
} from "@/lib/server/trades/replaceManualExecutionsAtomically";

import {
  NormalizedExecution,
} from "@/types/trade";

type ManualDeleteMode =
  | "execution_id"
  | "contract_key";

type EditTradeRequest = {
  deleteMode:
    ManualDeleteMode;

  deleteExecutionId?:
    string;

  contractKey?:
    string;

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
        EditTradeRequest;

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
            "Invalid edit request.",
        },
        {
          status: 400,
        }
      );
    }

    const insertedCount =
      await replaceManualExecutionsAtomically(
        body.executions,
        user.id,
        body.deleteMode,
        body.deleteExecutionId,
        body.contractKey
      );

    return Response.json({
      success: true,
      insertedCount,
    });

  } catch (error) {

    console.error(
      "MANUAL TRADE EDIT FAILED:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to save edited trade.",
      },
      {
        status: 500,
      }
    );
  }
}