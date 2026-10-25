import {
  syncAllBrokers,
} from "@/lib/server/sync/syncAllBrokers";

export async function GET(
  request: Request
) {
  const cronSecret =
    process.env.CRON_SECRET;

  // Fail closed if the secret is not configured.
  if (!cronSecret) {
    console.error(
      "CRON_SYNC_BLOCKED: CRON_SECRET is not configured."
    );

    return Response.json(
      {
        success: false,
        error: "Cron authentication is not configured",
      },
      {
        status: 500,
      }
    );
  }

  const authHeader =
    request.headers.get("authorization");

  if (
    authHeader !== `Bearer ${cronSecret}`
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

  try {
    await syncAllBrokers();

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "CRON SYNC FAILED:",
      error
    );

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
