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
  const rel = path.startsWith("/") ? path : `/${path}`;
  const envMedia = process.env.NEXT_PUBLIC_MEDIA_ORIGIN?.replace(/\/$/, "");
  if (envMedia) return `${envMedia}${rel}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${rel}`;
  }
  const internalBase =
    process.env.INTERNAL_MEDIA_ORIGIN?.replace(/\/$/, "") ||
    (process.env.INTERNAL_API_URL || "http://127.0.0.1:8005/api/v1")
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/$/, "") ||
    "http://127.0.0.1:8005";
  return `${internalBase}${rel}`;
}
