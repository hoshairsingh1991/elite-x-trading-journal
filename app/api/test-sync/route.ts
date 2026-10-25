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
      "TEST_SYNC_BLOCKED: CRON_SECRET is not configured."
    );

    return Response.json(
      {
        success: false,
        error:
          "Test sync authentication is not configured",
      },
      {
        status: 500,
      }
    );
  }

  // Require authentication before syncing any broker.
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
    const brokers =
      await syncAllBrokers();

    return Response.json({
      success: true,
      brokerCount:
        brokers?.length || 0,
      brokers,
    });
  } catch (error) {
    console.error(
      "TEST SYNC FAILED:",
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