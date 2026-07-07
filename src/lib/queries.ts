import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber } from "@/lib/format";
import { dayRange, weekRange, monthRange } from "@/lib/dates";
import {
  computeBudgetStatus,
  computeGoalProjection,
  computeHealthScore,
  savingsRate,
} from "@/lib/finance";
import type { ExpenseCategory } from "@/generated/prisma/client";
import { SIP_MONTHLY_TARGET } from "@/lib/constants";
import { applyDueRecurring } from "@/lib/actions/recurring";

export async function getDashboardData() {
  const user = await getCurrentUser();

  // Generate any due recurring income/expenses before reading this month's data.
  await applyDueRecurring(user.id).catch(() => 0);

  const now = new Date();
  const month = monthRange(now);
  const today = dayRange(now);
  const week = weekRange(now);

  const [
    budgets,
    monthByCategory,
    todayAgg,
    weekAgg,
    monthIncomeAgg,
    accounts,
    investments,
    goals,
    recent,
  ] = await Promise.all([
    prisma.budget.findMany({ where: { userId: user.id } }),
    prisma.expense.groupBy({
      by: ["category"],
      where: { userId: user.id, date: { gte: month.start, lte: month.end } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId: user.id, date: { gte: today.start, lte: today.end } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId: user.id, date: { gte: week.start, lte: week.end } },
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: { userId: user.id, date: { gte: month.start, lte: month.end } },
      _sum: { amount: true },
    }),
    prisma.account.findMany({ where: { userId: user.id } }),
    prisma.investment.findMany({ where: { userId: user.id } }),
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 8,
    }),
  ]);

  const spentByCategory = new Map<ExpenseCategory, number>();
  for (const row of monthByCategory) {
    spentByCategory.set(row.category, toNumber(row._sum.amount));
  }

  const monthlyBudget = budgets.reduce((acc, b) => acc + toNumber(b.amount), 0);
  const spentThisMonth = [...spentByCategory.values()].reduce((a, b) => a + b, 0);
  const spentToday = toNumber(todayAgg._sum.amount);
  const spentThisWeek = toNumber(weekAgg._sum.amount);

  const budgetStatus = computeBudgetStatus({
    monthlyBudget,
    spentThisMonth,
    spentToday,
    spentThisWeek,
    now,
  });

  // Savings / investments / net worth
  const totalSavings = accounts.reduce((a, acc) => a + toNumber(acc.balance), 0);
  const totalInvested = investments.reduce((a, i) => a + toNumber(i.invested), 0);
  const investmentValue = investments.reduce((a, i) => a + toNumber(i.currentValue), 0);
  const emergencyFund = accounts
    .filter((a) => a.type === "EMERGENCY")
    .reduce((a, acc) => a + toNumber(acc.balance), 0);
  const netWorth = totalSavings + investmentValue;

  const monthlyIncome = toNumber(monthIncomeAgg._sum.amount) || toNumber(user.monthlySalary);

  // SIP contribution target vs this month
  const sipContributed = investments
    .filter((i) => i.type === "SIP")
    .reduce((a, i) => a + toNumber(i.monthlySip), 0);

  // Goals with projections
  const goalsWithProjection = goals.map((g) => {
    const projection = computeGoalProjection(
      toNumber(g.targetAmount),
      toNumber(g.savedAmount),
      toNumber(g.monthlyContribution),
      now
    );
    return { goal: g, projection };
  });
  const bikeGoal = goalsWithProjection.find((g) =>
    g.goal.name.toLowerCase().includes("bike")
  );

  const smokingBudget = toNumber(
    budgets.find((b) => b.category === "SMOKING")?.amount ?? 0
  );
  const smokingSpent = spentByCategory.get("SMOKING") ?? 0;

  // Monthly savings = money that went into savings + investments this month.
  const monthlySavingsEstimate = Math.max(0, monthlyIncome - spentThisMonth);

  const health = computeHealthScore({
    monthlyIncome,
    monthlySavings: monthlySavingsEstimate,
    monthlyBudget,
    spentThisMonth,
    sipTarget: SIP_MONTHLY_TARGET,
    sipContributed,
    bikeGoalProgress: bikeGoal?.projection.progress ?? 0,
    smokingBudget,
    smokingSpent,
    emergencyFund,
    emergencyTarget: monthlyIncome * 3,
  });

  return {
    user,
    now,
    monthlyIncome,
    spentThisMonth,
    totalSavings,
    totalInvested,
    investmentValue,
    netWorth,
    emergencyFund,
    budgetStatus,
    savingsRatePct: savingsRate(monthlyIncome, monthlySavingsEstimate),
    sipTarget: SIP_MONTHLY_TARGET,
    sipContributed,
    goalsWithProjection,
    bikeGoal,
    health,
    recent,
    budgets: budgets.map((b) => ({
      category: b.category,
      amount: toNumber(b.amount),
      spent: spentByCategory.get(b.category) ?? 0,
    })),
    categorySpending: monthByCategory
      .map((r) => ({ category: r.category, amount: toNumber(r._sum.amount) }))
      .filter((r) => r.amount > 0)
      .sort((a, b) => b.amount - a.amount),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
