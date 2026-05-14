import { PublicShell } from "@/components/layout/PublicShell";
import { HomeContent } from "@/components/home/HomeContent";
import { fetchCategories, fetchProducts } from "@/lib/server-api";

export default async function Home() {
  const [categories, { results }] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
  ]);
  const featured = results.slice(0, 8);

  return (
    <PublicShell>
      <HomeContent categories={categories} featured={featured} />
    </PublicShell>
  );
}
