export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    const r = (data as { results: unknown }).results;
    if (Array.isArray(r)) return r as T[];
  }
  return [];
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_MEDIA_ORIGIN || "http://localhost:8005";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
