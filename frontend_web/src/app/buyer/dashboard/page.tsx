import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { ShoppingCart, Package, MessageCircle, Search } from "lucide-react";

export default function BuyerDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-recycle-charcoal">Your dashboard</h1>
      <p className="mt-2 text-recycle-muted">Welcome back — pick up where you left off.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <Search className="h-8 w-8 text-recycle-primary" />
          <h2 className="mt-4 font-semibold">Browse</h2>
          <p className="mt-2 text-sm text-recycle-muted">Search thousands of second-hand listings.</p>
          <Link href="/products" className="mt-4 inline-block">
            <AppButton size="sm">Go shopping</AppButton>
          </Link>
        </Card>
        <Card className="p-6">
          <ShoppingCart className="h-8 w-8 text-recycle-primary" />
          <h2 className="mt-4 font-semibold">Cart</h2>
          <p className="mt-2 text-sm text-recycle-muted">Review items before secure checkout.</p>
          <Link href="/buyer/cart" className="mt-4 inline-block">
            <AppButton size="sm" variant="outline">
              View cart
            </AppButton>
          </Link>
        </Card>
        <Card className="p-6">
          <Package className="h-8 w-8 text-recycle-primary" />
          <h2 className="mt-4 font-semibold">Orders</h2>
          <p className="mt-2 text-sm text-recycle-muted">Track delivery and payment status.</p>
          <Link href="/buyer/orders" className="mt-4 inline-block">
            <AppButton size="sm" variant="outline">
              My orders
            </AppButton>
          </Link>
        </Card>
        <Card className="p-6">
          <MessageCircle className="h-8 w-8 text-recycle-primary" />
          <h2 className="mt-4 font-semibold">Messages</h2>
          <p className="mt-2 text-sm text-recycle-muted">Chat with sellers about listings.</p>
          <Link href="/buyer/messages" className="mt-4 inline-block">
            <AppButton size="sm" variant="outline">
              Open inbox
            </AppButton>
          </Link>
        </Card>
      </div>
    </div>
  );
}
