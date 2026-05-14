import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingCart,
  Brain,
  FileText,
  Settings,
  MessageCircle,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & KPIs" },
  { href: "/admin/users", label: "Users", icon: Users, description: "Buyers, sellers, approvals" },
  { href: "/admin/support", label: "Messages", icon: MessageCircle, description: "Chat with buyers & sellers" },
  { href: "/admin/products", label: "Products", icon: Package, description: "Catalog moderation" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, description: "Taxonomy" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, description: "Fulfillment" },
  { href: "/admin/ai-analyses", label: "AI reports", icon: Brain, description: "Listing analyses" },
  { href: "/admin/dataset-report", label: "Datasets", icon: FileText, description: "Data health" },
  { href: "/admin/settings", label: "Settings", icon: Settings, description: "Platform" },
];

export function adminTitleFromPath(pathname: string): { title: string; subtitle: string } {
  const item = ADMIN_NAV.find((l) => pathname === l.href || pathname.startsWith(l.href + "/"));
  if (item) return { title: item.label, subtitle: item.description };
  return { title: "Admin", subtitle: "ReCycle control center" };
}
