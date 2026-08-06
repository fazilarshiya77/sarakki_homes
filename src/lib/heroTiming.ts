/**
 * Shared load/reveal choreography timings.
 * Loader, AppShell, Header and Hero all derive from these constants so the
 * sequence never drifts out of sync.
 */
export const LOADER_DURATION_MS = 2800;
export const LOADER_EXIT_MS = 700;
export const HERO_START_MS = LOADER_DURATION_MS + 80;

/** Seconds from app mount at which a hero element with `offsetMs` should appear. */
export function heroDelayMs(offsetMs: number) {
  return (HERO_START_MS + offsetMs) / 1000;
}
