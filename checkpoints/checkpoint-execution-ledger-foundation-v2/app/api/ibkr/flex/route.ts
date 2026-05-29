import { createClient }
from "@supabase/supabase-js";

const supabase =
createClient(
process.env
.NEXT_PUBLIC_SUPABASE_URL!,
process.env
.SUPABASE_SERVICE_ROLE_KEY!
);

function extractReferenceCode(
xml: string
) {

const match =
xml.match(
/<ReferenceCode>(.*?)<\/ReferenceCode>/
);

return match?.[1];
}

function sleep(
ms: number
) {

return new Promise(
(resolve) =>
setTimeout(
resolve,
ms
)
);
}

export async function POST() {

try {

console.log(
  "STARTING IBKR FLEX SYNC..."
);

// =========================================
// LOAD ACTIVE CONNECTION
// =========================================

const {
  data: connection,
  error:
    connectionError,
} = await supabase
  .from(
    "broker_connections"
  )
  .select("*")
  .eq(
    "is_active",
    true
  )
  .single();

if (
  connectionError ||
  !connection
) {

  return Response.json({
    success: false,
    error:
      "No active IBKR connection",
  });
}

// =========================================
// SEND FLEX REQUEST
// =========================================

const sendRequestUrl =
  `https://gdcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest?t=${connection.flex_token}&q=${connection.flex_query_id}&v=3`;

const sendResponse =
  await fetch(
    sendRequestUrl
  );

const sendXml =
  await sendResponse.text();

console.log(
  "SEND XML:",
  sendXml
);

// =========================================
// EXTRACT REFERENCE CODE
// =========================================

const referenceCode =
  extractReferenceCode(
    sendXml
  );

if (
  !referenceCode
) {

  return Response.json({
    success: false,
    error:
      "Failed to retrieve reference code",
    response:
      sendXml,
  });
}

// =========================================
// POLL FINAL REPORT
// =========================================

let finalXml =
  "";

let reportReady =
  false;

const maxAttempts =
  10;

for (
  let attempt = 0;
  attempt < maxAttempts;
  attempt++
) {

  const getStatementUrl =
    `https://gdcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.GetStatement?q=${referenceCode}&t=${connection.flex_token}&v=3`;

  const statementResponse =
    await fetch(
      getStatementUrl
    );

  const statementXml =
    await statementResponse.text();

  console.log(
  "FULL POLL XML:\n",
  statementXml
);

  if (
  statementXml.includes(
    "ClientAccountID"
  )
) {

  finalXml =
    statementXml;

  reportReady =
    true;

  break;
}

  await sleep(2000);
}

// =========================================
// TIMEOUT
// =========================================

if (
  !reportReady
) {

  return Response.json({
    success: false,
    error:
      "IBKR report polling timeout",
  });
}

// =========================================
// SUCCESS
// =========================================

return Response.json({
  success: true,
  xml: finalXml,
});

} catch (error) {

console.error(
  "IBKR FLEX ERROR:",
  error
);

return Response.json({
  success: false,
  error:
    "Internal server error",
});

}
}
