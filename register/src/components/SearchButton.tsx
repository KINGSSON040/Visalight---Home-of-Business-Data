"use client";

import { useFormStatus } from "react-dom";

export function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Söker…" : "Sök"}
    </button>
  );
}
