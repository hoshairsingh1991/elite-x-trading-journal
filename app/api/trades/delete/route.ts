import {
  createClient,
} from "@supabase/supabase-js";

import {
  deleteManualExecutionsAtomically,
} from "@/lib/server/trades/deleteManualExecutionsAtomically";

type ManualDeleteMode =
  | "execution_id"
  | "contract_key";

type DeleteTradeRequest = {
  deleteMode:
    ManualDeleteMode;

  deleteExecutionId?:
    string;

  contractKey?:
    string;
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
        DeleteTradeRequest;

    if (
      !body ||
      (
        body.deleteMode !==
          "execution_id" &&
        body.deleteMode !==
          "contract_key"
      )
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Invalid delete request.",
        },
        {
          status: 400,
        }
      );
    }

    const deletedCount =
      await deleteManualExecutionsAtomically(
        user.id,
        body.deleteMode,
        body.deleteExecutionId,
        body.contractKey
      );

    return Response.json({
      success: true,
      deletedCount,
    });

  } catch (error) {

    console.error(
      "MANUAL TRADE DELETE FAILED:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to delete trade.",
      },
      {
        status: 500,
      }
    );
  }
}