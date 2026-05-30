import {
  fetchFlexStatement,
} from "@/lib/server/brokers/ibkr/fetchFlexStatement";

import {
  parseIBKRCsv,
} from "@/lib/parsers/ibkrParser";

import {
  saveExecutions,
} from "@/lib/server/sync/saveExecutions";

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

  const xml =
    await fetchFlexStatement(
      broker
    );

  console.log(
    "XML RECEIVED:",
    xml.length,
    "bytes"
  );

  const executions =
    await parseIBKRCsv(
      xml
    );

  await saveExecutions(
  executions,
  broker.user_id
);

  console.log(
    "PARSED EXECUTIONS:",
    executions.length
  );

  return {
    success: true,

    brokerAccountId:
      broker.broker_account_id,

    xmlLength:
      xml.length,

    executionCount:
      executions.length,
  };
}