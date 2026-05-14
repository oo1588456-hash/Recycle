import { PublicShell } from "@/components/layout/PublicShell";
import { fetchCategories, fetchProducts } from "@/lib/server-api";
import { ProductsExplorer } from "@/components/product/ProductsExplorer";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string" && v) params[k] = v;
  }
  const [categories, page] = await Promise.all([fetchCategories(), fetchProducts(params)]);
  return (
    <PublicShell>
      <ProductsExplorer categories={categories} initial={page} initialQuery={params} />
    </PublicShell>
  );
}
