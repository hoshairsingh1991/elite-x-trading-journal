import {
  fetchFlexStatement,
} from "@/lib/server/brokers/ibkr/fetchFlexStatement";

import {
  parseIBKRCsv,
} from "@/lib/parsers/ibkrParser";

import {
  replaceBrokerExecutionsAtomically,
} from "@/lib/server/sync/replaceBrokerExecutionsAtomically";

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

if (executions.length === 0) {

  console.log(
    "NO EXECUTIONS FOUND. SKIPPING SYNC."
  );

  return {
    success: true,

    brokerAccountId:
      broker.broker_account_id,

    xmlLength:
      xml.length,

    executionCount: 0,
  };
}

const executionDates =
  Array.from(
    new Set(
      executions.map(
        (execution) =>
          execution.date
      )
    )
  );

console.log(
  "PARSED EXECUTIONS:",
  executions.length
);

await replaceBrokerExecutionsAtomically(
  executions,
  broker.user_id,
  broker.broker_account_id,
  executionDates
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