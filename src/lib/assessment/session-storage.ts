/**
 * Leadership Assessment — Draft Storage (localStorage)
 *
 * Persists draft answers (mid-chunk progress not yet submitted)
 * so users don't lose in-progress answers on accidental reload.
 *
 * Session identity (token, version) now lives in the URL.
 */

const KEYS = {
  draft: 'ops_assessment_draft',
} as const;

/* ------------------------------------------------------------------ */
/*  Draft Answers (mid-chunk progress)                                 */
/* ------------------------------------------------------------------ */

export function saveDraftAnswers(
  answers: Record<string, number | string>,
): void {
  try {
    localStorage.setItem(KEYS.draft, JSON.stringify(answers));
  } catch {
    // ignore
  }
}

export function getDraftAnswers(): Record<string, number | string> | null {
  try {
    const raw = localStorage.getItem(KEYS.draft);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, number | string>;
  } catch {
    return null;
  }
}

export function clearDraftAnswers(): void {
  try {
    localStorage.removeItem(KEYS.draft);
  } catch {
    // ignore
  }
}
