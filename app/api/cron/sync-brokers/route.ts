import {
  syncAllBrokers,
} from "@/lib/server/sync/syncAllBrokers";

export async function GET() {

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