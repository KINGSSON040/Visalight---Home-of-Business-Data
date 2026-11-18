export function isSafeMdx(source: string): boolean {
  if (/<\s*\/?\s*[a-zA-Z]/.test(source)) return false;
  if (/javascript\s*:/i.test(source)) return false;
  if (/\bon[a-z]+\s*=/i.test(source)) return false;
  if (/^\s*import\s/m.test(source)) return false;
  if (/^\s*export\s/m.test(source)) return false;
  return true;
}

export function isSafeHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  return /^https:\/\/[^\s]+$/i.test(href);
}
