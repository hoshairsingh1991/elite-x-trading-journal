import {
  syncAllBrokers,
} from "@/lib/server/sync/syncAllBrokers";

export async function GET() {

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