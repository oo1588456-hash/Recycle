import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { AppButton } from "@/components/ui/AppButton";
import { mediaUrl } from "@/lib/unwrap";
import type { Product } from "@/lib/types";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images?.find((i) => i.is_primary) || product.images?.[0];
  const src = mediaUrl(img?.image);
  const price = product.final_price || product.original_price;
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-recycle-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={`/products/${product.id}`} className="relative aspect-[4/3] bg-recycle-surface">
        {src ? (
          <Image src={src} alt="" fill className="object-cover transition group-hover:scale-[1.02]" sizes="(max-width:768px) 100vw, 25vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-recycle-muted">No image</div>
        )}
        {product.is_ai_evaluated && (
          <span className="absolute left-3 top-3">
            <Badge tone="mint">AI priced</Badge>
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-recycle-muted">
          {product.category?.name ?? "Uncategorised"}
        </p>
        <Link href={`/products/${product.id}`} className="mt-1 line-clamp-2 font-semibold text-recycle-charcoal hover:text-recycle-primary">
          {product.title}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-recycle-charcoal">
            {product.currency} {price}
          </span>
          {product.ai_condition_label && (
            <Badge tone="neutral">{product.ai_condition_label}</Badge>
          )}
          {typeof product.ai_condition_score === "number" && (
            <Badge tone="success">Score {product.ai_condition_score}</Badge>
          )}
        </div>
        {product.location && (
          <p className="mt-1 text-xs text-recycle-muted">{product.location}</p>
        )}
        <p className="mt-1 text-xs text-recycle-muted">
          Seller: {product.seller?.full_name || product.seller?.username}
        </p>
        <div className="mt-auto flex gap-2 pt-4">
          <Link href={`/products/${product.id}`} className="flex-1">
            <AppButton variant="outline" size="sm" className="w-full">
              View
            </AppButton>
          </Link>
          <Link href={`/products/${product.id}`} className="flex-1">
            <AppButton size="sm" className="w-full gap-1">
              <ShoppingBag className="h-4 w-4" /> Shop
            </AppButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
