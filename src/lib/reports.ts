import "server-only";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber } from "@/lib/format";
import { monthRange, weekRange } from "@/lib/dates";
import { CATEGORY_MAP } from "@/lib/constants";
import type { ExpenseCategory } from "@/generated/prisma/client";

async function summarize(
  userId: string,
  start: Date,
  end: Date,
  withDetail: boolean
) {
  const [expenses, incomeAgg] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { amount: "desc" },
    }),
    prisma.income.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  const expenseTotal = expenses.reduce((a, e) => a + toNumber(e.amount), 0);
  const income = toNumber(incomeAgg._sum.amount);

  const byCategoryMap = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    byCategoryMap.set(
      e.category,
      (byCategoryMap.get(e.category) ?? 0) + toNumber(e.amount)
    );
  }
  const byCategory = [...byCategoryMap.entries()]
    .map(([category, amount]) => ({
      category,
      label: CATEGORY_MAP[category].label,
      emoji: CATEGORY_MAP[category].emoji,
      color: CATEGORY_MAP[category].color,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    income,
    expenseTotal,
    savings: income - expenseTotal,
    count: expenses.length,
    byCategory,
    biggest: withDetail
      ? expenses.slice(0, 5).map((e) => ({
          id: e.id,
          amount: toNumber(e.amount),
          category: e.category,
          label: CATEGORY_MAP[e.category].label,
          emoji: CATEGORY_MAP[e.category].emoji,
          description: e.description,
          date: format(e.date, "dd MMM"),
        }))
      : [],
  };
}

export async function getReportData() {
  const user = await getCurrentUser();
  const now = new Date();
  const month = monthRange(now);
  const week = weekRange(now);

  const [monthly, weekly] = await Promise.all([
    summarize(user.id, month.start, month.end, true),
    summarize(user.id, week.start, week.end, true),
  ]);

  return {
    now,
    monthLabel: format(now, "MMMM yyyy"),
    weekLabel: `${format(week.start, "dd MMM")} – ${format(week.end, "dd MMM")}`,
    monthly,
    weekly,
  };
}

export type ReportData = Awaited<ReturnType<typeof getReportData>>;
