export async function
fetchFlex(
  broker: any
) {

  console.log(
    "IBKR ACCOUNT:",
    broker.broker_account_id
  );

  console.log(
    "FLEX QUERY:",
    broker.flex_query_id
  );

  return {
    success: true,
    brokerAccountId:
      broker.broker_account_id,
  };
}