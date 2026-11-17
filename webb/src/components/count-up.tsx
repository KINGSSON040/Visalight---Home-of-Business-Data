"use client";

import { useEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animate(from: number, to: number, duration: number, onFrame: (value: number) => void): () => void {
  const start = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    onFrame(Math.round(from + (to - from) * eased));
    if (t < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

/** Talet tickar från förra värdet till det nya. Första renderingen visar målet direkt. */
export function useTicker(target: number, duration = 700): number {
  const [shown, setShown] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    if (current.current === target) return;
    if (prefersReducedMotion()) {
      current.current = target;
      setShown(target);
      return;
    }
    const from = current.current;
    return animate(from, target, duration, (value) => {
      current.current = value;
      setShown(value);
    });
  }, [target, duration]);
  return shown;
}

/** Ett tal som räknar upp från noll när det syns på skärmen. Servern renderar slutvärdet. */
export function CountUp({ value, className = "", duration = 1200 }: { value: number; className?: string; duration?: number }) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setShown(value);
      return;
    }
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      setShown(value);
      return;
    }
    setShown(0);
    let stop: (() => void) | undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      stop = animate(0, value, duration, setShown);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop?.();
    };
  }, [value, duration]);
  return (
    <span ref={ref} className={`tabular ${className}`} data-value={value}>
      {shown.toLocaleString("sv-SE")}
    </span>
  );
}
