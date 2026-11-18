"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { readConsentFromDocument } from "@/lib/consent";

export function ThankYouPanel({
  title,
  text,
  nextLabel,
  promise,
  homeLabel,
}: {
  title: string;
  text: string;
  nextLabel: string;
  promise: string;
  homeLabel: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <div className="py-16">
      <h1 ref={heading} tabIndex={-1} className="max-w-3xl text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl">{text}</p>
      <p className="mt-4 max-w-2xl">
        {nextLabel} {promise}
      </p>
      <p className="mt-8">
        <Link href="/" className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">
          {homeLabel}
        </Link>
      </p>
    </div>
  );
}

export function PlausibleEvent({ name }: { name: "forfragan" | "ansokan" | "spontanansokan" }) {
  useEffect(() => {
    if (readConsentFromDocument() !== "analys") return;
    if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return;
    const key = `kandidator-event-${name}`;
    if (sessionStorage.getItem(key)) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (typeof window.plausible === "function") {
        window.plausible(name);
        sessionStorage.setItem(key, "1");
        window.clearInterval(timer);
      } else if (tries > 20) {
        window.clearInterval(timer);
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [name]);
  return null;
}
