"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, NAV_ITEMS, type NavItem } from "@/components/nav-items";
import { ExpenseForm } from "@/app/expenses/expense-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Bottom bar: Dashboard · Expenses · [ + ] · Budgets · More
  const left = PRIMARY_NAV.slice(0, 2); // Dashboard, Expenses
  const right = PRIMARY_NAV.slice(2, 3); // Budgets

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 items-center px-1 pb-[env(safe-area-inset-bottom)]">
        {left.map((item) => (
          <TabLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        {/* Center quick-add expense */}
        <div className="flex justify-center">
          <ExpenseForm
            trigger={
              <button
                aria-label="Add expense"
                className="-mt-5 grid size-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
              >
                <Plus className="size-6" />
              </button>
            }
          />
        </div>

        {right.map((item) => (
          <TabLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        {/* More */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger
            render={
              <button className="flex flex-col items-center gap-0.5 py-2 text-muted-foreground">
                <MoreHorizontal className="size-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            }
          />
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>All sections</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-2 p-4 pt-0">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors",
                      isActive(item.href)
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-0.5 py-2 transition-colors",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="size-5" />
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  );
}
