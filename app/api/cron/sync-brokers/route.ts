import {
  syncAllBrokers,
} from "@/lib/server/sync/syncAllBrokers";

export async function GET(
  request: Request
) {

  const {
    searchParams,
  } = new URL(
    request.url
  );

  const secret =
    searchParams.get(
      "secret"
    );

  if (
    secret !==
    process.env.CRON_SECRET
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