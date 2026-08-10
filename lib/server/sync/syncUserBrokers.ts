import {
  supabaseAdmin,
} from "@/lib/server/supabaseAdmin";

import {
  syncBroker,
} from "@/lib/server/sync/syncBroker";

export async function syncUserBrokers(
  userId: string
) {

  const {
    data: brokers,
    error,
  } = await supabaseAdmin
    .from("broker_connections")
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .eq(
      "is_active",
      true
    );

  if (error) {

    console.error(
      "FAILED TO LOAD USER BROKERS:",
      error
    );

    throw error;
  }

  const results = [];

  for (
    const broker of brokers || []
  ) {

    try {

      const result =
        await syncBroker(
          broker
        );

      results.push(
        result
      );

    } catch (error) {

      console.error(
        "BROKER SYNC FAILED:",
        broker.account_alias,
        broker.broker_account_id,
        error
      );

      results.push({
        success: false,
        brokerId: broker.id,
        brokerAccountId:
          broker.broker_account_id,
        accountAlias:
          broker.account_alias,
        error:
          error instanceof Error
            ? error.message
            : "Broker sync failed",
      });

    }

    // ==========================================
    // IBKR FLEX RATE LIMIT PROTECTION
    // ==========================================

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          3000
        )
    );
  }

  return results;
}