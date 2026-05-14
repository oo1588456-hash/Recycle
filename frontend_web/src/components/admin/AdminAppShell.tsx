"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  ExternalLink,
  Sparkles,
  LogOut,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ADMIN_NAV, adminTitleFromPath } from "@/lib/admin-nav";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/cn";

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const { title, subtitle } = adminTitleFromPath(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <RoleGuard allow={["superadmin"]}>
      <div className="admin-app min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(21,128,61,0.12),transparent)]">
        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="flex min-h-screen">
          {/* Sidebar — desktop */}
          <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-white/5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl shadow-slate-900/40 lg:flex">
            <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter user={user} logout={logout} />
          </aside>

          {/* Sidebar — mobile drawer */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col border-r border-white/5 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl transition-transform duration-200 ease-out lg:hidden",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button
                type="button"
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter user={user} logout={logout} />
          </aside>

          <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
            {/* Top bar */}
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">ReCycle</p>
                    <p className="truncate text-lg font-semibold tracking-tight text-slate-900">{title}</p>
                    <p className="truncate text-xs text-slate-500">{subtitle}</p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-recycle-primary hover:text-recycle-primary"
                  >
                    Storefront
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </Link>
                </div>
              </div>
            </header>

            <main className="relative flex-1 px-4 py-8 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-recycle-primary to-emerald-700 text-lg font-black text-white shadow-lg shadow-emerald-900/40">
            R
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">ReCycle</p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-emerald-400/90">Control center</p>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/10 text-white shadow-inner shadow-black/20 ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition",
                  active ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-slate-400 group-hover:text-emerald-300",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <span className="flex flex-col">
                <span>{item.label}</span>
                <span className="text-[10px] font-normal text-slate-500 group-hover:text-slate-400">{item.description}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function SidebarFooter({
  user,
  logout,
}: {
  user: { email?: string; full_name?: string | null } | null;
  logout: () => void;
}) {
  return (
    <div className="border-t border-white/10 p-4">
      <div className="rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
        <div className="flex items-center gap-2 text-emerald-400/90">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Signed in</span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-white">{user?.full_name || user?.username || user?.email}</p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
      <Link
        href="/"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-slate-500 hover:text-white lg:hidden"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open storefront
      </Link>
    </div>
  );
}
