import {
  syncAllBrokers,
} from "@/lib/server/sync/syncAllBrokers";

export async function GET(
  request: Request
) {

  const authHeader =
    request.headers.get(
      "authorization"
    );

  if (
    authHeader !==
    `Bearer ${process.env.CRON_SECRET}`
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