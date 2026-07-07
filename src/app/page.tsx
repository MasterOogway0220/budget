import Link from "next/link";
import { format } from "date-fns";
import {
  Wallet,
  Receipt,
  PiggyBank,
  TrendingUp,
  CalendarDays,
  CalendarRange,
  Target,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { buildInsights, buildAchievements } from "@/lib/insights";
import { formatINR, formatPercent, toNumber } from "@/lib/format";
import { CATEGORY_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CategoryChart } from "@/components/dashboard/category-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const d = await getDashboardData();
  const b = d.budgetStatus;

  const chartData = d.categorySpending.map((c) => ({
    name: CATEGORY_MAP[c.category].label,
    value: c.amount,
    color: CATEGORY_MAP[c.category].color,
  }));

  const dailyTone = b.dailyLeft >= 0 ? "positive" : "negative";
  const sipPct = d.sipTarget > 0 ? (d.sipContributed / d.sipTarget) * 100 : 0;
  const insights = buildInsights(d);
  const achievements = buildAchievements(d);
  const insightToneStyles: Record<string, string> = {
    good: "border-l-emerald-500 bg-emerald-500/5",
    warn: "border-l-amber-500 bg-amber-500/5",
    info: "border-l-sky-500 bg-sky-500/5",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi {d.user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s your financial picture for {format(d.now, "MMMM yyyy")}.
        </p>
      </div>

      {/* Safe-to-spend hero */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" /> You can safely spend today
            </p>
            <p
              className={`mt-1 text-4xl font-bold tracking-tight ${
                b.dailyLeft >= 0 ? "text-primary" : "text-rose-500"
              }`}
            >
              {formatINR(Math.max(0, b.dailyLeft))}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Spent {formatINR(b.spentToday)} today · daily allowance{" "}
              {formatINR(b.safeToSpendToday)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div>
              <p className="text-xs text-muted-foreground">This week left</p>
              <p className="text-lg font-semibold">{formatINR(b.weeklyLeft)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This month left</p>
              <p className="text-lg font-semibold">
                {formatINR(b.remainingThisMonth)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Monthly Income"
          value={formatINR(d.monthlyIncome)}
          icon={Wallet}
          tone="positive"
        />
        <StatCard
          label="Spent this month"
          value={formatINR(d.spentThisMonth)}
          icon={Receipt}
          tone="negative"
          hint={`${formatPercent(b.monthUtilization)} of budget`}
        />
        <StatCard
          label="Total Savings"
          value={formatINR(d.totalSavings)}
          icon={PiggyBank}
          hint={`Savings rate ${formatPercent(d.savingsRatePct)}`}
        />
        <StatCard
          label="Net Worth"
          value={formatINR(d.netWorth)}
          icon={TrendingUp}
          hint={`Invested ${formatINR(d.investmentValue)}`}
        />
      </div>

      {/* Budget windows */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Daily budget left"
          value={formatINR(b.dailyLeft)}
          icon={CalendarDays}
          tone={dailyTone}
        />
        <StatCard
          label="Weekly budget left"
          value={formatINR(b.weeklyLeft)}
          icon={CalendarRange}
          tone={b.weeklyLeft >= 0 ? "positive" : "negative"}
          hint={`Budget ${formatINR(b.weeklyBudget)}`}
        />
        <StatCard
          label="Remaining budget"
          value={formatINR(b.remainingThisMonth)}
          icon={Wallet}
          tone={b.remainingThisMonth >= 0 ? "positive" : "negative"}
          hint={`of ${formatINR(b.monthlyBudget)}`}
        />
      </div>

      {/* Insights (rule-based coach) */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Sparkles className="size-4 text-primary" />
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={cn(
                "rounded-md border-l-2 px-3 py-2 text-sm",
                insightToneStyles[ins.tone]
              )}
            >
              {ins.text}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spending breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={chartData} />
          </CardContent>
        </Card>

        {/* Health score */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-primary">{d.health.score}</span>
              <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
              <Badge variant="secondary" className="ml-auto">
                {d.health.label}
              </Badge>
            </div>
            <Progress value={d.health.score} />
            <ul className="space-y-1.5 pt-1">
              {d.health.breakdown.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 text-muted-foreground">{f.label}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <span className="w-8 text-right tabular-nums">{f.score}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Goals + SIP + Emergency */}
      <div className="grid gap-6 lg:grid-cols-3">
        {d.bikeGoal && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Target className="size-4 text-primary" /> {d.bikeGoal.goal.name}
              </CardTitle>
              <Badge variant="secondary">
                {formatPercent(d.bikeGoal.projection.progress)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={d.bikeGoal.projection.progress} />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatINR(toNumber(d.bikeGoal.goal.savedAmount))} saved
                </span>
                <span className="font-medium">
                  {formatINR(toNumber(d.bikeGoal.goal.targetAmount))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {d.bikeGoal.projection.estimatedCompletion
                  ? `Est. completion ${format(d.bikeGoal.projection.estimatedCompletion, "MMMM yyyy")}`
                  : "Set a monthly contribution to project completion"}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> SIP Progress
            </CardTitle>
            <Badge variant="secondary">{formatPercent(sipPct)}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={Math.min(100, sipPct)} />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatINR(d.sipContributed)} / month
              </span>
              <span className="font-medium">Target {formatINR(d.sipTarget)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Emergency Fund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold">{formatINR(d.emergencyFund)}</p>
            <p className="text-xs text-muted-foreground">
              Target {formatINR(d.monthlyIncome * 3)} (3 months of income)
            </p>
            <Progress
              value={Math.min(100, (d.emergencyFund / (d.monthlyIncome * 3 || 1)) * 100)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {achievements.map((a) => (
              <div
                key={a.key}
                title={a.hint}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                  a.earned
                    ? "border-primary/40 bg-primary/5"
                    : "border-dashed opacity-50 grayscale"
                )}
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-[11px] font-medium leading-tight">{a.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Transactions</CardTitle>
          <Link
            href="/expenses"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {d.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            <ul className="divide-y">
              {d.recent.map((e) => {
                const cat = CATEGORY_MAP[e.category];
                return (
                  <li key={e.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full text-base"
                      style={{ backgroundColor: `${cat.color}22` }}
                    >
                      {cat.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {e.description || cat.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cat.label} · {format(e.date, "dd MMM")}
                      </p>
                    </div>
                    <span className="font-medium">
                      -{formatINR(toNumber(e.amount))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
