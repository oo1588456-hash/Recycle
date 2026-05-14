/** Browser: same-origin `/api/v1` when unset (use Next.js rewrites). SSR: full internal URL. */
export function getBrowserApiBase(): string {
  const u = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (u) return u;
  return "/api/v1";
}

export function getServerApiBase(): string {
  return (
    process.env.INTERNAL_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8005/api/v1"
  );
}
