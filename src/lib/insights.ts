import { format } from "date-fns";
import { formatINR, formatPercent } from "@/lib/format";
import type { DashboardData } from "@/lib/queries";

export type InsightTone = "good" | "warn" | "info";
export interface Insight {
  tone: InsightTone;
  text: string;
}

/**
 * Deterministic, rule-based financial coaching (no LLM). Reads the already
 * computed dashboard data and surfaces the most relevant nudges.
 */
export function buildInsights(d: DashboardData): Insight[] {
  const out: Insight[] = [];
  const b = d.budgetStatus;

  if (b.dailyLeft < 0) {
    out.push({
      tone: "warn",
      text: `You're ${formatINR(Math.abs(b.dailyLeft))} over today's safe-to-spend. Ease off for the rest of the day.`,
    });
  } else {
    out.push({
      tone: "good",
      text: `You can safely spend ${formatINR(b.dailyLeft)} more today and stay on track.`,
    });
  }

  // Smoking (a normal expense category, but worth calling out)
  const smoking = d.budgets.find((x) => x.category === "SMOKING");
  if (smoking) {
    if (smoking.spent > smoking.amount) {
      out.push({
        tone: "warn",
        text: `Smoking is ${formatINR(smoking.spent - smoking.amount)} over its ${formatINR(smoking.amount)} monthly budget.`,
      });
    } else if (smoking.spent > 0) {
      const saved = smoking.amount - smoking.spent;
      out.push({
        tone: "info",
        text: `Smoking: ${formatINR(smoking.spent)} of ${formatINR(smoking.amount)} used — ${formatINR(saved)} left this month.`,
      });
    }
  }

  if (d.savingsRatePct >= 40) {
    out.push({
      tone: "good",
      text: `Strong savings rate at ${formatPercent(d.savingsRatePct)} of income.`,
    });
  } else {
    out.push({
      tone: "warn",
      text: `Savings rate is ${formatPercent(d.savingsRatePct)} — aim for 40%+ to hit your goals faster.`,
    });
  }

  if (d.sipContributed >= d.sipTarget) {
    out.push({ tone: "good", text: `SIP is on track at ${formatINR(d.sipContributed)}/month.` });
  } else {
    out.push({
      tone: "warn",
      text: `SIP is ${formatINR(d.sipContributed)} of ${formatINR(d.sipTarget)} — top it up to stay consistent.`,
    });
  }

  if (d.bikeGoal?.projection.estimatedCompletion) {
    out.push({
      tone: "info",
      text: `Bike goal ${formatPercent(d.bikeGoal.projection.progress)} — on pace for ${format(d.bikeGoal.projection.estimatedCompletion, "MMMM yyyy")}.`,
    });
  }

  if (b.monthUtilization > 100) {
    out.push({
      tone: "warn",
      text: `You've used ${formatPercent(b.monthUtilization)} of this month's spending budget.`,
    });
  }

  return out;
}

export interface Achievement {
  key: string;
  label: string;
  emoji: string;
  earned: boolean;
  hint: string;
}

export function buildAchievements(d: DashboardData): Achievement[] {
  const anyGoalDone = d.goalsWithProjection.some(
    (g) => g.projection.progress >= 100
  );
  return [
    {
      key: "saved-10k",
      label: "₹10,000 Saved",
      emoji: "💰",
      earned: d.totalSavings >= 10000,
      hint: "Reach ₹10,000 in savings",
    },
    {
      key: "sip-complete",
      label: "SIP Champion",
      emoji: "📈",
      earned: d.sipContributed >= d.sipTarget,
      hint: "Hit your monthly SIP target",
    },
    {
      key: "under-budget",
      label: "Under Budget",
      emoji: "🎯",
      earned:
        d.budgetStatus.monthlyBudget > 0 &&
        d.spentThisMonth <= d.budgetStatus.monthlyBudget,
      hint: "Keep spending under your monthly budget",
    },
    {
      key: "saver",
      label: "Super Saver",
      emoji: "🏆",
      earned: d.savingsRatePct >= 40,
      hint: "Save 40%+ of your income",
    },
    {
      key: "investor",
      label: "Investor",
      emoji: "🌱",
      earned: d.totalInvested > 0,
      hint: "Start investing",
    },
    {
      key: "goal-getter",
      label: "Goal Getter",
      emoji: "🥇",
      earned: anyGoalDone,
      hint: "Complete a savings goal",
    },
    {
      key: "emergency-ready",
      label: "Safety Net",
      emoji: "🛟",
      earned: d.emergencyFund >= d.monthlyIncome * 3 && d.monthlyIncome > 0,
      hint: "Build a 3-month emergency fund",
    },
  ];
}
