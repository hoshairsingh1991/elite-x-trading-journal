import {
  NormalizedExecution,
} from "@/types/trade";

// =====================================================
// STORAGE KEY
// =====================================================

const STORAGE_KEY =
  "elite-x-executions";

// =====================================================
// LOAD EXECUTIONS
// =====================================================

export function loadExecutions():
  NormalizedExecution[] {

  if (
    typeof window ===
    "undefined"
  ) {

    return [];
  }

  try {

    const storedExecutions =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (
      !storedExecutions
    ) {

      return [];
    }

    const parsedExecutions =
      JSON.parse(
        storedExecutions
      );

    if (
      !Array.isArray(
        parsedExecutions
      )
    ) {

      return [];
    }

    return parsedExecutions;

  } catch (error) {

    console.error(
      "FAILED TO LOAD EXECUTIONS:",
      error
    );

    return [];
  }
}

// =====================================================
// SAVE EXECUTIONS
// =====================================================

export function saveExecutions(
  executions:
    NormalizedExecution[]
): void {

  if (
    typeof window ===
    "undefined"
  ) {

    return;
  }

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        executions
      )
    );

  } catch (error) {

    console.error(
      "FAILED TO SAVE EXECUTIONS:",
      error
    );
  }
}

// =====================================================
// APPEND EXECUTIONS
// =====================================================

export function appendExecutions(
  newExecutions:
    NormalizedExecution[]
): NormalizedExecution[] {

  const existingExecutions =
    loadExecutions();

  // ============================================
  // DEDUPE
  // ============================================

  const existingIds =
    new Set(
      existingExecutions.map(
        (
          execution
        ) =>
          execution.id
      )
    );

  const uniqueExecutions =
    newExecutions.filter(
      (
        execution
      ) =>
        !existingIds.has(
          execution.id
        )
    );

  const updatedExecutions = [

    ...existingExecutions,

    ...uniqueExecutions,
  ];

  saveExecutions(
    updatedExecutions
  );

  return updatedExecutions;
}

// =====================================================
// CLEAR EXECUTIONS
// =====================================================

export function clearExecutions():
  void {

  if (
    typeof window ===
    "undefined"
  ) {

    return;
  }

  try {

    localStorage.removeItem(
      STORAGE_KEY
    );

  } catch (error) {

    console.error(
      "FAILED TO CLEAR EXECUTIONS:",
      error
    );
  }
}