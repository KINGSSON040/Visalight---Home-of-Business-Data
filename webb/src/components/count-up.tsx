"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Talet tickar mot target. Utan rörelse hoppar det direkt. */
export function useCountUp(target: number, { active = true, duration = 900, fromZero = false } = {}): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(fromZero ? 0 : target);
  const started = useRef(false);

  useEffect(() => {
    if (!active) return;
    const from = !started.current && fromZero ? 0 : shownRef.current;
    started.current = true;
    if (prefersReducedMotion() || from === target) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    let frame = 0;
    const begin = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - begin) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const value = Math.round(from + (target - from) * eased);
      shownRef.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration, fromZero]);

  return shown;
}

export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = "0px 0px -10% 0px"): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, seen]);
  return seen;
}

/** Ett tal som rullar upp när det syns. */
export function CountUp({ value, className = "", suffix = "" }: { value: number; className?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref);
  const shown = useCountUp(value, { active: seen, fromZero: true, duration: 1400 });
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {shown.toLocaleString("sv-SE")}
      {suffix}
    </span>
  );
}
