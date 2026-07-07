import { format, startOfYear, endOfYear } from "date-fns";
import { Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber, formatINR } from "@/lib/format";
import { dayRange, weekRange, monthRange } from "@/lib/dates";
import { CATEGORY_MAP } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DeleteButton } from "@/components/delete-button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseForm, type ExpenseFormData } from "./expense-form";
import { ExpenseFilters } from "./expense-filters";
import { deleteExpense } from "@/lib/actions/expenses";
import type { ExpenseCategory, Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

function dateFilterFor(range: string): { gte: Date; lte: Date } | undefined {
  switch (range) {
    case "today":
      return { gte: dayRange().start, lte: dayRange().end };
    case "week":
      return { gte: weekRange().start, lte: weekRange().end };
    case "month":
      return { gte: monthRange().start, lte: monthRange().end };
    case "year":
      return { gte: startOfYear(new Date()), lte: endOfYear(new Date()) };
    default:
      return undefined;
  }
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const range = sp.range ?? "month";
  const category = sp.category;
  const q = sp.q?.trim();
  const user = await getCurrentUser();

  const dateFilter = dateFilterFor(range);
  const where: Prisma.ExpenseWhereInput = {
    userId: user.id,
    ...(dateFilter ? { date: dateFilter } : {}),
    ...(category && category !== "all"
      ? { category: category as ExpenseCategory }
      : {}),
    ...(q
      ? {
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { tags: { has: q } },
          ],
        }
      : {}),
  };

  const [expenses, agg] = await Promise.all([
    prisma.expense.findMany({ where, orderBy: { date: "desc" }, take: 300 }),
    prisma.expense.aggregate({ where, _sum: { amount: true }, _count: true }),
  ]);

  const total = toNumber(agg._sum.amount);

  const toFormData = (e: (typeof expenses)[number]): ExpenseFormData => ({
    id: e.id,
    amount: toNumber(e.amount),
    category: e.category,
    paymentMethod: e.paymentMethod,
    date: format(e.date, "yyyy-MM-dd"),
    description: e.description,
    tags: e.tags,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Expenses"
        description="Every rupee you spend, tracked by category."
      >
        <ExpenseForm />
      </PageHeader>

      <div className="mb-4">
        <ExpenseFilters />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <StatCard
          label="Total (filtered)"
          value={formatINR(total)}
          icon={Receipt}
          tone="negative"
        />
        <StatCard label="Transactions" value={String(agg._count)} />
      </div>

      {expenses.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No expenses match these filters.
        </Card>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="flex flex-col gap-2 md:hidden">
            {expenses.map((e) => {
              const cat = CATEGORY_MAP[e.category];
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full text-lg"
                    style={{ backgroundColor: `${cat.color}22` }}
                  >
                    {cat.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {e.description || cat.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cat.label} · {format(e.date, "dd MMM")} · {e.paymentMethod}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold">
                      {formatINR(toNumber(e.amount))}
                    </span>
                    <div className="flex items-center">
                      <ExpenseForm expense={toFormData(e)} />
                      <DeleteButton
                        label="expense"
                        onDelete={deleteExpense.bind(null, e.id)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <Card className="hidden overflow-hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => {
                  const cat = CATEGORY_MAP[e.category];
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {format(e.date, "dd MMM")}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="max-w-[16rem] truncate">
                        {e.description || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.paymentMethod}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatINR(toNumber(e.amount))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <ExpenseForm expense={toFormData(e)} />
                          <DeleteButton
                            label="expense"
                            onDelete={deleteExpense.bind(null, e.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
