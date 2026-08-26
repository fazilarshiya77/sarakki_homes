"use client";

import { useEffect } from "react";

/**
 * Locks page scroll while `active` is true — used by every modal/overlay
 * that shouldn't let the page scroll behind it (ConsultationModal,
 * Header's mobile menu, Header's contact-details modal).
 *
 * Naively setting `document.body.style.overflow = "hidden"` makes the
 * scrollbar disappear the instant it's called, which shifts every
 * element on the page sideways by the scrollbar's width and forces a
 * full-page reflow/repaint — the "whole screen re-rendering" jank this
 * project hit once already. The fix used to be a permanent
 * `scrollbar-gutter: stable` in globals.css, but that reserved the
 * space on every page at all times, which showed up as a visible empty
 * gap next to the nav bar even when nothing was open. This hook instead
 * measures the actual scrollbar width and compensates with
 * `padding-right` ONLY while `active` is true, so there's zero visual
 * footprint when nothing is locked and zero layout shift when something
 * is.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [active]);
}
