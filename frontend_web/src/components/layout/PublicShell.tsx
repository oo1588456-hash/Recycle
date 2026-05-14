"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Package,
  LayoutDashboard,
  MessageCircle,
  Headphones,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/auth-store";
import { AppButton } from "@/components/ui/AppButton";

const navPublic = [
  { href: "/products", label: "Products" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function AnnouncementBar() {
  return (
    <div className="bg-recycle-primary-dark py-2 text-center text-xs font-medium text-white sm:text-sm">
      Recycle smarter. Buy trusted second-hand products with AI-assisted fair pricing.
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const sellerRestricted =
    user?.role === "seller" &&
    (user?.seller_account_status === "pending" || user?.seller_account_status === "rejected");

  const buyerNav = [
    { href: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Shop", icon: Package },
    { href: "/buyer/cart", label: "Cart", icon: ShoppingCart },
    { href: "/buyer/orders", label: "Orders", icon: Package },
    { href: "/buyer/messages", label: "Messages", icon: MessageCircle },
    { href: "/buyer/support", label: "Admin help", icon: Headphones },
  ];

  const sellerNavFull = [
    { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/products", label: "My products", icon: Package },
    { href: "/seller/products/create", label: "Sell", icon: Package },
    { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
    { href: "/seller/messages", label: "Messages", icon: MessageCircle },
  ];

  const sellerNav = sellerRestricted
    ? [
        { href: "/seller/pending-approval", label: "Account", icon: LayoutDashboard },
        { href: "/seller/messages", label: "Messages", icon: MessageCircle },
      ]
    : sellerNavFull;

  const adminNav = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: User },
    { href: "/admin/support", label: "Messages", icon: MessageCircle },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  ];

  const roleLinks =
    user?.role === "superadmin" ? adminNav : user?.role === "seller" ? sellerNav : user ? buyerNav : [];

  return (
    <header className="sticky top-0 z-50 border-b border-recycle-border bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-recycle-primary text-lg font-black text-white">
            R
          </span>
          <span className="text-lg font-bold tracking-tight text-recycle-charcoal">ReCycle</span>
        </Link>

        <div className="hidden flex-1 justify-center px-4 md:flex">
          <div className="relative w-full max-w-xl">
            <form action="/products" method="get" className="w-full">
              <input
                name="search"
                placeholder="Search phones, laptops, fashion…"
                className="w-full rounded-full border border-recycle-border bg-recycle-surface py-2 pl-4 pr-4 text-sm shadow-inner focus:border-recycle-primary focus:outline-none focus:ring-2 focus:ring-recycle-mint"
              />
            </form>
          </div>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {(user ? roleLinks : navPublic).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-recycle-muted hover:bg-recycle-mint/50 hover:text-recycle-charcoal"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          {user ? (
            <>
              {user.role === "buyer" && (
                <Link
                  href="/buyer/cart"
                  className="rounded-full p-2 text-recycle-charcoal hover:bg-recycle-mint/60"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              )}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-recycle-border px-3 py-1.5 text-sm font-medium hover:border-recycle-primary"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.full_name || user.username || user.email}</span>
                </button>
                <div className="invisible absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-recycle-border bg-white py-1 shadow-lg group-hover:visible">
                  <Link
                    href={
                      user.role === "superadmin"
                        ? "/admin/dashboard"
                        : user.role === "seller"
                          ? "/seller/profile"
                          : "/buyer/profile"
                    }
                    className="block px-4 py-2 text-sm hover:bg-recycle-surface"
                  >
                    Profile
                  </Link>
                  {user.role === "superadmin" && (
                    <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-recycle-surface">
                      <Shield className="h-4 w-4" /> Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-recycle-error hover:bg-red-50"
                    onClick={() => {
                      logout();
                      window.location.href = "/";
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <AppButton variant="ghost" size="sm">
                  Log in
                </AppButton>
              </Link>
              <Link href="/register">
                <AppButton size="sm">Register</AppButton>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-recycle-border bg-white px-4 py-4 md:hidden">
          <form action="/products" method="get" className="mb-4">
            <input
              name="search"
              placeholder="Search…"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </form>
          <div className="flex flex-col gap-2">
            {(user ? roleLinks : navPublic).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg py-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </>
            )}
            {user && (
              <button
                type="button"
                className="text-left text-sm text-recycle-error"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
              >
                Log out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-recycle-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-recycle-primary text-lg font-black text-white">
                R
              </span>
              <span className="text-lg font-bold">ReCycle</span>
            </div>
            <p className="mt-3 text-sm text-recycle-muted">
              AI-assisted pricing for a fairer UK second-hand marketplace.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-recycle-charcoal">Marketplace</h4>
            <ul className="mt-3 space-y-2 text-sm text-recycle-muted">
              <li>
                <Link href="/products" className="hover:text-recycle-primary">
                  Browse products
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-recycle-primary">
                  How AI pricing works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-recycle-charcoal">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-recycle-muted">
              <li>
                <Link href="/register" className="hover:text-recycle-primary">
                  Register as buyer or seller
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-recycle-charcoal">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-recycle-muted">
              <li>
                <Link href="/contact" className="hover:text-recycle-primary">
                  Contact
                </Link>
              </li>
              <li>
                <span className="cursor-default">Privacy & Terms (demo)</span>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-recycle-border pt-6 text-center text-xs text-recycle-muted">
          © {new Date().getFullYear()} ReCycle — Final year project demo. Not a real retailer.
        </p>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
