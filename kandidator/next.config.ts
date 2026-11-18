import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy.
 *
 * script-src includes 'unsafe-inline' because Next.js 16 Cache Components
 * prerenders a static shell. A per-request nonce cannot be attached to that
 * shell (Next.js documents that nonces require dynamic rendering and conflict
 * with Partial Prerendering). 'unsafe-eval' is omitted in production.
 * Development adds 'unsafe-eval' because React's dev tooling uses eval.
 *
 * style-src includes 'unsafe-inline' because Cloudflare Turnstile injects a
 * style tag and Next.js emits inline style attributes.
 *
 * Calendly hosts are allowlisted for the employer-page embed. The script and
 * iframe are mounted only after analytics consent, because the widget sets
 * cookies. See components/booking/CalendlyEmbed.tsx.
 *
 * Plausible is allowlisted but the script is not rendered until consent.
 * Turnstile (challenges.cloudflare.com) loads only together with a form.
 * Vercel Blob client uploads connect to the blob store and vercel.com.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://plausible.io https://challenges.cloudflare.com https://assets.calendly.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  "img-src 'self' data: blob: https://*.blob.vercel-storage.com",
  "font-src 'self'",
  "connect-src 'self' https://plausible.io https://*.plausible.io https://challenges.cloudflare.com https://*.blob.vercel-storage.com https://blob.vercel-storage.com https://vercel.com https://*.vercel.com https://calendly.com https://*.calendly.com",
  "frame-src https://challenges.cloudflare.com https://calendly.com https://*.calendly.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/*": ["./data/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
