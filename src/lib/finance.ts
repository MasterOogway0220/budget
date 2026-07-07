import { daysInMonth, daysRemainingInMonth } from "@/lib/dates";

// ---------------------------------------------------------------------------
// Budget status — "how much can I spend today / this week / this month"
// ---------------------------------------------------------------------------

export interface BudgetStatusInput {
  monthlyBudget: number; // sum of category allocations
  spentThisMonth: number;
  spentToday: number;
  spentThisWeek: number;
  now?: Date;
}

export interface BudgetStatus {
  monthlyBudget: number;
  spentThisMonth: number;
  remainingThisMonth: number;
  monthUtilization: number; // 0-100+

  /** Adaptive "safe to spend today": remaining month budget spread over days left. */
  safeToSpendToday: number;
  spentToday: number;
  dailyLeft: number;

  weeklyBudget: number;
  spentThisWeek: number;
  weeklyLeft: number;
}

export function computeBudgetStatus(input: BudgetStatusInput): BudgetStatus {
  const now = input.now ?? new Date();
  const { monthlyBudget, spentThisMonth, spentToday, spentThisWeek } = input;

  const remainingThisMonth = monthlyBudget - spentThisMonth;
  const daysLeft = daysRemainingInMonth(now);

  // Spread what's left across the days left (including today).
  const safeToSpendToday = Math.max(0, remainingThisMonth) / daysLeft;
  const dailyLeft = safeToSpendToday - spentToday;

  const weeklyBudget = (monthlyBudget * 7) / daysInMonth(now);
  const weeklyLeft = weeklyBudget - spentThisWeek;

  return {
    monthlyBudget,
    spentThisMonth,
    remainingThisMonth,
    monthUtilization: monthlyBudget > 0 ? (spentThisMonth / monthlyBudget) * 100 : 0,
    safeToSpendToday,
    spentToday,
    dailyLeft,
    weeklyBudget,
    spentThisWeek,
    weeklyLeft,
  };
}

// ---------------------------------------------------------------------------
// Goal projection — when will I hit the target
// ---------------------------------------------------------------------------

export interface GoalProjection {
  progress: number; // 0-100
  remaining: number;
  monthsToComplete: number | null;
  estimatedCompletion: Date | null;
}

export function computeGoalProjection(
  targetAmount: number,
  savedAmount: number,
  monthlyContribution: number,
  now: Date = new Date()
): GoalProjection {
  const remaining = Math.max(0, targetAmount - savedAmount);
  const progress = targetAmount > 0 ? Math.min(100, (savedAmount / targetAmount) * 100) : 0;

  if (remaining <= 0) {
    return { progress: 100, remaining: 0, monthsToComplete: 0, estimatedCompletion: now };
  }
  if (monthlyContribution <= 0) {
    return { progress, remaining, monthsToComplete: null, estimatedCompletion: null };
  }

  const monthsToComplete = Math.ceil(remaining / monthlyContribution);
  const estimatedCompletion = new Date(now);
  estimatedCompletion.setMonth(estimatedCompletion.getMonth() + monthsToComplete);

  return { progress, remaining, monthsToComplete, estimatedCompletion };
}

// ---------------------------------------------------------------------------
// Financial health score (0-100)
// ---------------------------------------------------------------------------

export interface HealthScoreInput {
  monthlyIncome: number;
  monthlySavings: number; // amount saved + invested this month
  monthlyBudget: number;
  spentThisMonth: number;
  sipTarget: number;
  sipContributed: number;
  bikeGoalProgress: number; // 0-100
  smokingBudget: number;
  smokingSpent: number;
  emergencyFund: number;
  emergencyTarget: number; // e.g. 3x monthly income
}

export interface HealthScore {
  score: number;
  breakdown: { label: string; score: number; weight: number }[];
  label: string;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function computeHealthScore(input: HealthScoreInput): HealthScore {
  // Budget discipline — reward staying under budget.
  const budgetDiscipline =
    input.monthlyBudget > 0
      ? clamp01(1 - (input.spentThisMonth - input.monthlyBudget) / input.monthlyBudget)
      : 0.5;

  // Savings rate — target 40%+ of income saved/invested.
  const savingsRate =
    input.monthlyIncome > 0 ? input.monthlySavings / input.monthlyIncome : 0;
  const savingsScore = clamp01(savingsRate / 0.4);

  // Investment consistency — SIP contributed vs target.
  const sipScore =
    input.sipTarget > 0 ? clamp01(input.sipContributed / input.sipTarget) : 1;

  // Goal progress.
  const goalScore = clamp01(input.bikeGoalProgress / 100);

  // Smoking control — reward staying under smoking budget.
  const smokingScore =
    input.smokingBudget > 0
      ? clamp01(1 - input.smokingSpent / input.smokingBudget)
      : 0.5;

  // Emergency fund coverage.
  const emergencyScore =
    input.emergencyTarget > 0
      ? clamp01(input.emergencyFund / input.emergencyTarget)
      : 0.5;

  const factors = [
    { label: "Budget Discipline", score: budgetDiscipline, weight: 0.2 },
    { label: "Savings Rate", score: savingsScore, weight: 0.25 },
    { label: "Investment Consistency", score: sipScore, weight: 0.15 },
    { label: "Goal Progress", score: goalScore, weight: 0.15 },
    { label: "Smoking Control", score: smokingScore, weight: 0.15 },
    { label: "Emergency Fund", score: emergencyScore, weight: 0.1 },
  ];

  const score = Math.round(
    factors.reduce((acc, f) => acc + f.score * f.weight, 0) * 100
  );

  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";

  return {
    score,
    label,
    breakdown: factors.map((f) => ({
      label: f.label,
      score: Math.round(f.score * 100),
      weight: f.weight,
    })),
  };
}

// ---------------------------------------------------------------------------
// Month projection — run-rate forecast for the current month
// ---------------------------------------------------------------------------

export interface MonthProjection {
  avgDailySpend: number;
  projectedSpend: number;
  projectedSavings: number;
  daysElapsed: number;
  daysInMonth: number;
}

export function computeMonthProjection(input: {
  monthlyIncome: number;
  spentSoFar: number;
  daysElapsed: number;
  daysInMonth: number;
}): MonthProjection {
  const { monthlyIncome, spentSoFar, daysElapsed, daysInMonth } = input;
  const avgDailySpend = daysElapsed > 0 ? spentSoFar / daysElapsed : 0;
  const projectedSpend = avgDailySpend * daysInMonth;
  return {
    avgDailySpend,
    projectedSpend,
    projectedSavings: monthlyIncome - projectedSpend,
    daysElapsed,
    daysInMonth,
  };
}

// ---------------------------------------------------------------------------
// Savings rate helper
// ---------------------------------------------------------------------------

export function savingsRate(income: number, saved: number): number {
  if (income <= 0) return 0;
  return Math.max(0, Math.min(100, (saved / income) * 100));
}
