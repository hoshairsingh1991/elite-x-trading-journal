import {
  syncAllBrokers,
} from "@/lib/server/sync/syncAllBrokers";

export async function POST() {

  try {

    const results =
      await syncAllBrokers();

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