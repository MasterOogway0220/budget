import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber, formatINR, formatPercent } from "@/lib/format";
import { monthRange } from "@/lib/dates";
import { CATEGORY_MAP } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BudgetForm } from "./budget-form";
import { deleteBudget } from "@/lib/actions/budgets";
import { Wallet, TrendingDown, PiggyBank } from "lucide-react";
import type { ExpenseCategory } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const user = await getCurrentUser();
  const month = monthRange();

  const [budgets, spendByCategory] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: user.id },
      orderBy: { category: "asc" },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: { userId: user.id, date: { gte: month.start, lte: month.end } },
      _sum: { amount: true },
    }),
  ]);

  const spentMap = new Map<ExpenseCategory, number>(
    spendByCategory.map((row) => [row.category, toNumber(row._sum.amount)])
  );

  const rows = budgets.map((b) => {
    const budgetAmount = toNumber(b.amount);
    const spent = spentMap.get(b.category) ?? 0;
    const pct = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
    return {
      category: b.category,
      budgetAmount,
      spent,
      remaining: budgetAmount - spent,
      pct,
      over: spent > budgetAmount,
    };
  });

  const totalBudget = rows.reduce((sum, r) => sum + r.budgetAmount, 0);
  const totalSpent = rows.reduce((sum, r) => sum + r.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Budgets"
        description="Set a monthly cap per category and track how much is left."
      >
        <BudgetForm />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total budget"
          value={formatINR(totalBudget)}
          icon={Wallet}
        />
        <StatCard
          label="Spent this month"
          value={formatINR(totalSpent)}
          icon={TrendingDown}
          tone="negative"
        />
        <StatCard
          label="Remaining"
          value={formatINR(remaining)}
          icon={PiggyBank}
          tone={remaining >= 0 ? "positive" : "negative"}
        />
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No budgets yet. Set one to start tracking your monthly caps.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => {
            const cat = CATEGORY_MAP[r.category];
            const barValue = Math.min(100, r.pct);
            return (
              <Card key={r.category}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${cat.color}22`,
                        color: cat.color,
                      }}
                    >
                      <span>{cat.emoji}</span>
                      {cat.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <BudgetForm
                        budget={{ category: r.category, amount: r.budgetAmount }}
                      />
                      <DeleteButton
                        label="budget"
                        onDelete={deleteBudget.bind(null, r.category)}
                      />
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold tracking-tight">
                      {formatINR(r.spent)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      of {formatINR(r.budgetAmount)}
                    </span>
                  </div>

                  <Progress
                    value={barValue}
                    className={r.over ? "[&_[data-slot=progress-indicator]]:bg-rose-500" : ""}
                  />

                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={
                        r.over ? "font-medium text-rose-500" : "text-muted-foreground"
                      }
                    >
                      {formatPercent(r.pct)} used
                    </span>
                    <span
                      className={
                        r.remaining < 0
                          ? "font-medium text-rose-500"
                          : "text-muted-foreground"
                      }
                    >
                      {r.remaining < 0
                        ? `${formatINR(r.remaining)} over`
                        : `${formatINR(r.remaining)} left`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
