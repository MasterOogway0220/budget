import "server-only";
import { addMonths, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber } from "@/lib/format";
import { monthRange, daysInMonth, dayOfMonth } from "@/lib/dates";
import { computeMonthProjection, computeGoalProjection } from "@/lib/finance";

export async function getTimelineData() {
  const user = await getCurrentUser();
  const now = new Date();
  const month = monthRange(now);

  const [monthExpenseAgg, monthIncomeAgg, accounts, investments, goals] =
    await Promise.all([
      prisma.expense.aggregate({
        where: { userId: user.id, date: { gte: month.start, lte: month.end } },
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
    ]);

  const spentSoFar = toNumber(monthExpenseAgg._sum.amount);
  const monthlyIncome =
    toNumber(monthIncomeAgg._sum.amount) || toNumber(user.monthlySalary);

  const projection = computeMonthProjection({
    monthlyIncome,
    spentSoFar,
    daysElapsed: dayOfMonth(now),
    daysInMonth: daysInMonth(now),
  });

  const currentBalance = accounts.reduce((a, x) => a + toNumber(x.balance), 0);
  const investmentValue = investments.reduce(
    (a, x) => a + toNumber(x.currentValue),
    0
  );
  const netWorth = currentBalance + investmentValue;

  // At the current pace, this is what we add to net worth each month.
  const monthlyGrowth = Math.max(0, projection.projectedSavings);

  // 6-month net-worth forecast.
  const forecast = Array.from({ length: 7 }, (_, i) => ({
    month: format(addMonths(now, i), "MMM yy"),
    netWorth: Math.round(netWorth + monthlyGrowth * i),
    projected: i > 0,
  }));

  const expectedMonthEndBalance = currentBalance + monthlyGrowth;

  const goalsWithProjection = goals.map((g) => ({
    goal: {
      id: g.id,
      name: g.name,
      targetAmount: toNumber(g.targetAmount),
      savedAmount: toNumber(g.savedAmount),
      monthlyContribution: toNumber(g.monthlyContribution),
    },
    projection: computeGoalProjection(
      toNumber(g.targetAmount),
      toNumber(g.savedAmount),
      toNumber(g.monthlyContribution),
      now
    ),
  }));

  return {
    now,
    monthlyIncome,
    spentSoFar,
    projection,
    currentBalance,
    netWorth,
    monthlyGrowth,
    expectedMonthEndBalance,
    forecast,
    goalsWithProjection,
  };
}

export type TimelineData = Awaited<ReturnType<typeof getTimelineData>>;
