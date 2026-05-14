import { unwrapList } from "@/lib/unwrap";
import type { Category, Product } from "@/lib/types";

const API =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8005/api/v1";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await getJson<unknown>("/categories/");
  return unwrapList<Category>(data);
}

export async function fetchProducts(params?: Record<string, string>): Promise<{
  results: Product[];
  count: number;
  next: string | null;
}> {
  const qs = new URLSearchParams(params ?? {});
  const url = `/products/${qs.toString() ? `?${qs}` : ""}`;
  const data = await getJson<unknown>(url);
  const results = unwrapList<Product>(data);
  const count =
    data && typeof data === "object" && "count" in data
      ? Number((data as { count: number }).count)
      : results.length;
  const next =
    data && typeof data === "object" && "next" in data
      ? ((data as { next: string | null }).next ?? null)
      : null;
  return { results, count, next };
}

export async function fetchProduct(id: string): Promise<Product> {
  return getJson<Product>(`/products/${id}/`);
}
