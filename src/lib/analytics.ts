import "server-only";
import { subMonths, startOfMonth, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber } from "@/lib/format";
import { monthRange } from "@/lib/dates";
import { CATEGORY_MAP } from "@/lib/constants";

const MONTHS_BACK = 6;

export async function getAnalyticsData() {
  const user = await getCurrentUser();
  const now = new Date();
  const windowStart = startOfMonth(subMonths(now, MONTHS_BACK - 1));
  const month = monthRange(now);

  const [incomes, expenses, accounts, investments, monthByCategory] =
    await Promise.all([
      prisma.income.findMany({
        where: { userId: user.id, date: { gte: windowStart } },
        select: { amount: true, date: true },
      }),
      prisma.expense.findMany({
        where: { userId: user.id, date: { gte: windowStart } },
        select: { amount: true, date: true },
      }),
      prisma.account.findMany({ where: { userId: user.id } }),
      prisma.investment.findMany({ where: { userId: user.id } }),
      prisma.expense.groupBy({
        by: ["category"],
        where: { userId: user.id, date: { gte: month.start, lte: month.end } },
        _sum: { amount: true },
      }),
    ]);

  // --- Monthly trend (last 6 months) ---
  const bucketKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const incomeByMonth = new Map<string, number>();
  const expenseByMonth = new Map<string, number>();
  for (const i of incomes) {
    const k = bucketKey(i.date);
    incomeByMonth.set(k, (incomeByMonth.get(k) ?? 0) + toNumber(i.amount));
  }
  for (const e of expenses) {
    const k = bucketKey(e.date);
    expenseByMonth.set(k, (expenseByMonth.get(k) ?? 0) + toNumber(e.amount));
  }

  const monthlyTrend = Array.from({ length: MONTHS_BACK }, (_, idx) => {
    const d = subMonths(now, MONTHS_BACK - 1 - idx);
    const k = bucketKey(d);
    const income = incomeByMonth.get(k) ?? 0;
    const expense = expenseByMonth.get(k) ?? 0;
    return {
      month: format(d, "MMM"),
      income,
      expense,
      savings: Math.max(0, income - expense),
    };
  });

  // --- Category breakdown (this month) ---
  const categoryBreakdown = monthByCategory
    .map((r) => {
      const cat = CATEGORY_MAP[r.category];
      return { name: cat.label, value: toNumber(r._sum.amount), color: cat.color };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  // --- Net worth composition ---
  const totalSavings = accounts.reduce((a, x) => a + toNumber(x.balance), 0);
  const investmentValue = investments.reduce(
    (a, x) => a + toNumber(x.currentValue),
    0
  );
  const netWorthComposition = [
    { name: "Savings", value: totalSavings, color: "var(--chart-1)" },
    { name: "Investments", value: investmentValue, color: "var(--chart-2)" },
  ].filter((x) => x.value > 0);

  // --- Investment invested vs current ---
  const investmentBreakdown = investments.map((i) => ({
    name: i.name,
    invested: toNumber(i.invested),
    currentValue: toNumber(i.currentValue),
  }));

  const totalIncome6m = monthlyTrend.reduce((a, m) => a + m.income, 0);
  const totalExpense6m = monthlyTrend.reduce((a, m) => a + m.expense, 0);

  return {
    monthlyTrend,
    categoryBreakdown,
    netWorthComposition,
    investmentBreakdown,
    totalSavings,
    investmentValue,
    netWorth: totalSavings + investmentValue,
    totalIncome6m,
    totalExpense6m,
    avgMonthlySavings:
      monthlyTrend.reduce((a, m) => a + m.savings, 0) / MONTHS_BACK,
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;
