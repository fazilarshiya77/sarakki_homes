/**
 * Shared premium micro-interaction overlay — DESIGN_SYSTEM.md §5 buttons.
 * Drop as the last child of any button/anchor that also carries the
 * `btn-fx` class (see `buttonClasses()` in Button.tsx, or apply both by
 * hand on one-off CTAs). Purely decorative, so it's inert to layout: the
 * shine wrapper is absolutely positioned and the sparkles sit outside it,
 * meaning normal-flow children (icon + label) are unaffected.
 */
export function ButtonFX() {
  return (
    <>
      <span className="btn-shine-wrap">
        <span className="btn-shine" />
      </span>
      <span className="btn-sparkle btn-sparkle-1" />
      <span className="btn-sparkle btn-sparkle-2" />
      <span className="btn-sparkle btn-sparkle-3" />
    </>
  );
}
