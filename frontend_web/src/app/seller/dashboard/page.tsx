import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { Package, LineChart, MessageCircle } from "lucide-react";

export default function SellerDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-recycle-charcoal">Seller hub</h1>
      <p className="mt-2 text-recycle-muted">Professional tools to list, price, and fulfil orders.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <Package className="h-8 w-8 text-recycle-primary" />
          <h2 className="mt-4 font-semibold">Listings</h2>
          <p className="mt-2 text-sm text-recycle-muted">Draft, publish, and archive your inventory.</p>
          <Link href="/seller/products" className="mt-4 inline-block">
            <AppButton size="sm">My products</AppButton>
          </Link>
        </Card>
        <Card className="p-6">
          <LineChart className="h-8 w-8 text-recycle-primary" />
          <h2 className="mt-4 font-semibold">AI pricing</h2>
          <p className="mt-2 text-sm text-recycle-muted">Gemini-backed suggestions with transparent JSON output.</p>
          <Link href="/seller/products/create" className="mt-4 inline-block">
            <AppButton size="sm" variant="outline">
              New listing
            </AppButton>
          </Link>
        </Card>
        <Card className="p-6">
          <MessageCircle className="h-8 w-8 text-recycle-primary" />
          <h2 className="mt-4 font-semibold">Inbox</h2>
          <p className="mt-2 text-sm text-recycle-muted">Reply to buyers about condition and delivery.</p>
          <Link href="/seller/messages" className="mt-4 inline-block">
            <AppButton size="sm" variant="outline">
              Messages
            </AppButton>
          </Link>
        </Card>
      </div>
    </div>
  );
}
