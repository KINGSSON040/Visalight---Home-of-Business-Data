export function GET() {
  return new Response("Smakprovet beställs på sidan /smakprov.", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
