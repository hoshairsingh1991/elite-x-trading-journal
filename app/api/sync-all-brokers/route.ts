import {
  createClient,
} from "@supabase/supabase-js";

import {
  syncUserBrokers,
} from "@/lib/server/sync/syncUserBrokers";

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

    const results =
      await syncUserBrokers(
        user.id
      );

    return Response.json({
      success: true,
      results,
    });

  } catch (error) {

    console.error(
      "MANUAL SYNC FAILED:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Manual sync failed",
      },
      {
        status: 500,
      }
    );
  }
}