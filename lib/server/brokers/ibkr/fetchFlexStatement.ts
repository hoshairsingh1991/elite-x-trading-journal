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

  const sendResponse =
    await fetch(
      sendRequestUrl
    );

  const sendXml =
    await sendResponse.text();

  const referenceCode =
    extractReferenceCode(
      sendXml
    );

  if (
    !referenceCode
  ) {

    throw new Error(
      "Failed to retrieve reference code"
    );
  }

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