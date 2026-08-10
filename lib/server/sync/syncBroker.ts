import {
  fetchFlex,
} from "@/lib/server/brokers/ibkr/fetchFlex";

import {
  updateSyncStatus,
} from "@/lib/server/sync/updateSyncStatus";

export async function syncBroker(
  broker: any
) {

  console.log(
    "SYNCING BROKER:",
    broker.account_alias
  );

  if (
    broker.broker ===
    "IBKR"
  ) {

    try {

      const result =
        await fetchFlex(
          broker
        );

      await updateSyncStatus(
        broker.id,
        result.executionCount,
        "success",
        null
      );

      console.log(
        "FETCH RESULT:",
        result
      );

      return {
        success: true,
        brokerId:
          broker.id,
        brokerAccountId:
          broker.broker_account_id,
        accountAlias:
          broker.account_alias,
      };

    } catch (error) {

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Broker sync failed";

      console.error(
        "BROKER SYNC FAILED:",
        broker.account_alias,
        broker.broker_account_id,
        error
      );

      await updateSyncStatus(
        broker.id,
        0,
        "error",
        errorMessage
      );

      return {
        success: false,
        brokerId:
          broker.id,
        brokerAccountId:
          broker.broker_account_id,
        accountAlias:
          broker.account_alias,
        error:
          errorMessage,
      };
    }
  }

  return {
    success: true,
    brokerId:
      broker.id,
    brokerAccountId:
      broker.broker_account_id,
    accountAlias:
      broker.account_alias,
  };
}