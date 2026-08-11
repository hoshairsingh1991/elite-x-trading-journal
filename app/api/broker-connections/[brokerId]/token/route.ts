import {
  createClient,
} from "@supabase/supabase-js";

import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      brokerId: string;
    }>;
  }
) {
  try {

    // =========================================
    // AUTHENTICATE USER
    // =========================================

    const authHeader =
      request.headers.get(
        "authorization"
      );

    if (!authHeader) {

      return Response.json(
        {
          success: false,
          error: "Unauthorized",
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
      error: authError,
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      authError ||
      !user
    ) {

      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }

    // =========================================
    // GET BROKER ID FROM ROUTE
    // =========================================

    const {
      brokerId,
    } = await context.params;

    if (!brokerId) {

      return Response.json(
        {
          success: false,
          error:
            "Broker ID is required",
        },
        {
          status: 400,
        }
      );

    }

    // =========================================
    // LOAD ONLY THIS USER'S BROKER
    // =========================================

    const {
      data: broker,
      error: brokerError,
    } =
      await supabaseAdmin
        .from(
          "broker_connections"
        )
        .select(
          "id, user_id, flex_token"
        )
        .eq(
          "id",
          brokerId
        )
        .eq(
          "user_id",
          user.id
        )
        .single();

    if (
      brokerError ||
      !broker
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Broker connection not found",
        },
        {
          status: 404,
        }
      );

    }

    // =========================================
    // RETURN TOKEN
    // =========================================

    return Response.json({
      success: true,
      flexToken:
        broker.flex_token || "",
    });

  } catch (error) {

    console.error(
      "FLEX TOKEN RETRIEVAL FAILED:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to retrieve Flex Token",
      },
      {
        status: 500,
      }
    );

  }
}