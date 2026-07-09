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

export async function
fetchFlexStatement(
  broker: any
) {

  const sendRequestUrl =
    `https://gdcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest?t=${broker.flex_token}&q=${broker.flex_query_id}&v=3`;

// =================================================
// REQUEST FLEX REPORT
// =================================================

const maxSendRequestAttempts =
  5;

const sendRequestRetryDelay =
  3000;

let referenceCode:
  string | undefined;

for (
  let attempt = 1;
  attempt <= maxSendRequestAttempts;
  attempt++
) {

  const sendResponse =
    await fetch(
      sendRequestUrl
    );

  const sendXml =
    await sendResponse.text();


  referenceCode =
    extractReferenceCode(
      sendXml
    );

  if (
    referenceCode
  ) {

    break;
  }

  // =============================================
  // IBKR RATE LIMIT
  // =============================================

  if (
    sendXml.includes(
      "<ErrorCode>1018</ErrorCode>"
    )
  ) {

    console.log(
      `IBKR rate limit hit. Retrying (${attempt}/${maxSendRequestAttempts})...`
    );

await sleep(
  sendRequestRetryDelay
);

    continue;
  }

console.error(
  sendXml
);

throw new Error(
  "Failed to retrieve reference code"
);
}

if (
  !referenceCode
) {

throw new Error(
  `IBKR Flex SendRequest failed after ${maxSendRequestAttempts} attempts due to repeated rate limiting.`
);
}

  let finalXml =
    "";

  let reportReady =
    false;

const maxStatementPollAttempts =
  10;

for (
  let attempt = 0;
  attempt < maxStatementPollAttempts;
  attempt++
) {

    const getStatementUrl =
      `https://gdcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.GetStatement?q=${referenceCode}&t=${broker.flex_token}&v=3`;

    const statementResponse =
      await fetch(
        getStatementUrl
      );

    const statementXml =
      await statementResponse.text();

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

    await sleep(
      2000
    );
  }

  if (
    !reportReady
  ) {

    throw new Error(
      "IBKR report polling timeout"
    );
  }

  return finalXml;
}