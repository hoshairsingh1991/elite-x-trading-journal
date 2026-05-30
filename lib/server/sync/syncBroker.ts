import {
  fetchFlex,
} from "@/lib/server/brokers/ibkr/fetchFlex";

export async function
syncBroker(
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

    const result =
  await fetchFlex(
    broker
  );

console.log(
  "FETCH RESULT:",
  result
);
  }

  return {
    success: true,
    brokerId:
      broker.id,
  };
}