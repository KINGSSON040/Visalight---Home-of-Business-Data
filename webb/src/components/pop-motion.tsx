"use client";

import { useEffect, useRef, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useInView<T extends Element>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
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
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen]);
  return [ref, seen];
}

/** Räknar upp från förra värdet till nästa. Hoppar direkt när rörelse är avstängd. */
export function useCountUp(target: number, run = true, duration = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const started = useRef(false);
  useEffect(() => {
    if (!run) return;
    const start = started.current ? from.current : 0;
    started.current = true;
    if (reduced || start === target) {
      from.current = target;
      setValue(target);
      return;
    }
    let frame = 0;
    const begin = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - begin) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(start + (target - start) * eased);
      from.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, run, reduced, duration]);
  return value;
}

export function CountUp({ value, className }: { value: number; className?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const shown = useCountUp(value, seen, 1400);
  return (
    <span ref={ref} className={className} data-value={value}>
      {(seen ? shown : 0).toLocaleString("sv-SE")}
    </span>
  );
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Siffror som rullar som hjulen i en spelautomat. Skärmläsare får talet som text. */
export function SlotNumber({ value, className }: { value: number; className?: string }) {
  const text = value.toLocaleString("sv-SE");
  const chars = [...text];
  return (
    <span className={className} data-urval-count={String(value)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((char, index) => {
          const key = `${chars.length - index}`;
          if (!/\d/.test(char)) {
            return (
              <span key={key} className="inline-block w-[0.25em]">
                {" "}
              </span>
            );
          }
          return (
            <span key={key} className="reel">
              <span
                className="reel-strip"
                style={{
                  transform: `translateY(-${Number(char)}em)`,
                  transitionDelay: `${(chars.length - index) * 60}ms`,
                }}
              >
                {DIGITS.map((digit) => (
                  <span key={digit}>{digit}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

const CONFETTI_COLORS = ["#ff1f8f", "#ffd400", "#ff5a3c", "#a6f000", "#ffffff"];

/** En kort konfettismäll. burst ändras för att smälla igen. */
export function Confetti({ burst }: { burst: number }) {
  const reduced = useReducedMotion();
  if (burst === 0 || reduced) return null;
  const pieces = Array.from({ length: 26 }, (_, index) => {
    const angle = (index / 26) * Math.PI * 2 + (burst % 7) * 0.3;
    const distance = 90 + ((index * 37 + burst * 13) % 110);
    return {
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      dx: `${Math.round(Math.cos(angle) * distance * 1.6)}px`,
      dy: `${Math.round(Math.sin(angle) * distance)}px`,
      rot: `${(index * 97) % 540}deg`,
      round: index % 3 === 0,
      delay: `${(index % 5) * 25}ms`,
    };
  });
  return (
    <span key={burst} className="confetti" aria-hidden="true">
      {pieces.map((piece, index) => (
        <i
          key={index}
          style={
            {
              background: piece.color,
              borderRadius: piece.round ? "999px" : "2px",
              animationDelay: piece.delay,
              "--dx": piece.dx,
              "--dy": piece.dy,
              "--rot": piece.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}
