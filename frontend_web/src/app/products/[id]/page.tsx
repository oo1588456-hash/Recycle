import { PublicShell } from "@/components/layout/PublicShell";
import { fetchProduct } from "@/lib/server-api";
import { ProductDetail } from "@/components/product/ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
  let product;
  try {
    product = await fetchProduct(params.id);
  } catch {
    notFound();
  }
  return (
    <PublicShell>
      <ProductDetail product={product} />
    </PublicShell>
  );
}
