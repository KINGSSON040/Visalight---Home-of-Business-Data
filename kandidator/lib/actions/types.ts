export type ActionResult =
  | { ok: true }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string> };
