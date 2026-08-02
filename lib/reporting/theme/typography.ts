/**
 * ============================================================================
 * ELITEX TRADING OS
 * PDF Typography System
 * ============================================================================
 *
 * Canonical typography used across every PDF report.
 *
 * Do NOT hardcode font sizes or weights inside PDF components.
 *
 * ============================================================================
 */

export const typography = {

  /* ==========================================================================
     Titles
     ========================================================================== */

  heading1: {
    fontSize: 22,
    fontWeight: "bold" as const,
  },

  heading2: {
    fontSize: 16,
    fontWeight: "bold" as const,
  },

  heading3: {
    fontSize: 13,
    fontWeight: "bold" as const,
  },

  /* ==========================================================================
     Body
     ========================================================================== */

  body: {
    fontSize: 10,
    fontWeight: "normal" as const,
  },

  small: {
    fontSize: 9,
    fontWeight: "normal" as const,
  },

  caption: {
    fontSize: 8,
    fontWeight: "normal" as const,
  },

  label: {
    fontSize: 9,
    fontWeight: "bold" as const,
  },

};