import {
  NormalizedExecution,
} from "@/types/trade";

const SUPPORTED_CURRENCIES = new Set([
  "USD",
  "CAD",
  "EUR",
  "GBP",
  "JPY",
  "INR",
]);

const VALID_ACTIONS = new Set([
  "BUY",
  "SELL",
]);

function
requireNonEmptyString(
  value: unknown,
  fieldName: string
): string {

  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  return value.trim();
}

function
requireFiniteNumber(
  value: unknown,
  fieldName: string
): number {

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `${fieldName} must be a finite number.`
    );
  }

  return value;
}

export function
validateManualExecutions(
  executions: unknown
): asserts executions is
  NormalizedExecution[] {

  if (
    !Array.isArray(executions)
  ) {
    throw new Error(
      "Executions must be an array."
    );
  }

  if (
    executions.length === 0
  ) {
    throw new Error(
      "No executions provided."
    );
  }

  for (
    let index = 0;
    index < executions.length;
    index++
  ) {

    const execution =
      executions[index];

    if (
      !execution ||
      typeof execution !== "object"
    ) {
      throw new Error(
        `Execution ${index + 1} is invalid.`
      );
    }

    const item =
      execution as Record<
        string,
        unknown
      >;

    const id =
      requireNonEmptyString(
        item.id,
        `Execution ${index + 1} ID`
      );

    const date =
      requireNonEmptyString(
        item.date,
        `Execution ${index + 1} date`
      );

    const executionTimestamp =
      requireNonEmptyString(
        item.executionTimestamp,
        `Execution ${index + 1} execution timestamp`
      );

    const ticker =
      requireNonEmptyString(
        item.ticker,
        `Execution ${index + 1} ticker`
      );

    const contract =
      requireNonEmptyString(
        item.contract,
        `Execution ${index + 1} contract`
      );

    const account =
      requireNonEmptyString(
        item.account,
        `Execution ${index + 1} account`
      );

    const assetType =
      requireNonEmptyString(
        item.assetType,
        `Execution ${index + 1} asset type`
      );

    const action =
      item.action;

    if (
      typeof action !== "string" ||
      !VALID_ACTIONS.has(action)
    ) {
      throw new Error(
        `Execution ${index + 1} action must be BUY or SELL.`
      );
    }

    const quantity =
      requireFiniteNumber(
        item.quantity,
        `Execution ${index + 1} quantity`
      );

    if (quantity <= 0) {
      throw new Error(
        `Execution ${index + 1} quantity must be greater than zero.`
      );
    }

    const executionPrice =
      requireFiniteNumber(
        item.executionPrice,
        `Execution ${index + 1} execution price`
      );

    if (executionPrice <= 0) {
      throw new Error(
        `Execution ${index + 1} execution price must be greater than zero.`
      );
    }

    const executionValue =
      requireFiniteNumber(
        item.executionValue,
        `Execution ${index + 1} execution value`
      );

    if (executionValue < 0) {
      throw new Error(
        `Execution ${index + 1} execution value cannot be negative.`
      );
    }

    const fees =
      requireFiniteNumber(
        item.fees,
        `Execution ${index + 1} fees`
      );

    if (fees < 0) {
      throw new Error(
        `Execution ${index + 1} fees cannot be negative.`
      );
    }

    const multiplier =
      requireFiniteNumber(
        item.multiplier,
        `Execution ${index + 1} multiplier`
      );

    if (multiplier <= 0) {
      throw new Error(
        `Execution ${index + 1} multiplier must be greater than zero.`
      );
    }

    const currency =
      requireNonEmptyString(
        item.currency,
        `Execution ${index + 1} currency`
      ).toUpperCase();

    if (
      !SUPPORTED_CURRENCIES.has(
        currency
      )
    ) {
      throw new Error(
        `Execution ${index + 1} currency is not supported.`
      );
    }

    if (
      item.feeCurrency !==
        undefined &&
      item.feeCurrency !== null
    ) {

      const feeCurrency =
        requireNonEmptyString(
          item.feeCurrency,
          `Execution ${index + 1} fee currency`
        ).toUpperCase();

      if (
        !SUPPORTED_CURRENCIES.has(
          feeCurrency
        )
      ) {
        throw new Error(
          `Execution ${index + 1} fee currency is not supported.`
        );
      }
    }

    const contractKey =
      requireNonEmptyString(
        item.contractKey,
        `Execution ${index + 1} contract key`
      );

    if (
      !contractKey.startsWith(
        "MANUAL-"
      )
    ) {
      throw new Error(
        `Execution ${index + 1} must belong to a manual trade lifecycle.`
      );
    }

    const expectedValue =
      executionPrice *
      quantity *
      multiplier;

    const valueTolerance =
      Math.max(
        0.00000001,
        Math.abs(expectedValue) *
          0.00000001
      );

    if (
      Math.abs(
        executionValue -
          expectedValue
      ) > valueTolerance
    ) {
      throw new Error(
        `Execution ${index + 1} execution value does not match price, quantity, and multiplier.`
      );
    }

    if (
      typeof id !== "string" ||
      typeof date !== "string" ||
      typeof executionTimestamp !== "string" ||
      typeof ticker !== "string" ||
      typeof contract !== "string" ||
      typeof account !== "string" ||
      typeof assetType !== "string"
    ) {
      throw new Error(
        `Execution ${index + 1} contains invalid fields.`
      );
    }
  }
}