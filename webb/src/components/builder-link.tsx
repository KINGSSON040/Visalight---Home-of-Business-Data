"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

export function BuilderLink({ className, children }: { className?: string; children?: ReactNode }) {
  const pathname = usePathname();

  function open(event: MouseEvent<HTMLAnchorElement>) {
    const node = document.getElementById("urval");
    if (pathname === "/" && node) {
      event.preventDefault();
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", "/#urval");
      return;
    }
    if (pathname !== "/") {
      event.preventDefault();
      window.location.assign("/#urval");
    }
  }

  return (
    <a href="/#urval" onClick={open} className={className}>
      {children ?? "Till listbyggaren"}
    </a>
  );
}
