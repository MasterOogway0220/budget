import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  Target,
  TrendingUp,
  Landmark,
  BarChart3,
  LineChart,
  FileText,
  Repeat,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom tab bar (max 4 + Add + More). */
  primary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { href: "/expenses", label: "Expenses", icon: Receipt, primary: true },
  { href: "/budgets", label: "Budgets", icon: Wallet, primary: true },
  { href: "/goals", label: "Goals", icon: Target, primary: true },
  { href: "/income", label: "Income", icon: Landmark },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/timeline", label: "Timeline", icon: LineChart },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/recurring", label: "Recurring", icon: Repeat },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((i) => i.primary);
