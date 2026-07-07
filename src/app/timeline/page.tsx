import { format } from "date-fns";
import {
  Sparkles,
  Wallet,
  Receipt,
  TrendingUp,
  PiggyBank,
  Target,
  CalendarClock,
} from "lucide-react";
import { getTimelineData } from "@/lib/timeline";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ForecastChart } from "./forecast-chart";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const d = await getTimelineData();
  const p = d.projection;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Financial Timeline"
        description="Where your money is heading — at your current pace."
      />

      {/* Expected month-end hero */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" /> Expected balance at
              month end
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-primary">
              {formatINR(d.expectedMonthEndBalance)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Projected at your current pace · Day {p.daysElapsed} of{" "}
              {p.daysInMonth}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Current balance</p>
              <p className="text-lg font-semibold">
                {formatINR(d.currentBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly growth</p>
              <p className="text-lg font-semibold text-emerald-500">
                +{formatINR(d.monthlyGrowth)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projection stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="This month income"
          value={formatINR(d.monthlyIncome)}
          icon={Wallet}
          tone="positive"
        />
        <StatCard
          label="Spent so far"
          value={formatINR(d.spentSoFar)}
          icon={Receipt}
          tone="negative"
          hint={`Day ${p.daysElapsed} of ${p.daysInMonth}`}
        />
        <StatCard
          label="Projected total spend"
          value={formatINR(p.projectedSpend)}
          icon={TrendingUp}
          hint={`Avg ${formatINR(p.avgDailySpend)}/day · at current pace`}
        />
        <StatCard
          label="Projected savings"
          value={formatINR(p.projectedSavings)}
          icon={PiggyBank}
          tone={p.projectedSavings >= 0 ? "positive" : "negative"}
          hint="At your current pace"
        />
      </div>

      {/* Net worth forecast */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" /> Net Worth Forecast
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Current plus the next 6 months, projected at your current pace.
            Estimates only.
          </p>
        </CardHeader>
        <CardContent>
          <ForecastChart data={d.forecast} />
        </CardContent>
      </Card>

      {/* Goal timelines */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Target className="size-4 text-primary" /> Goal Timelines
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Estimated completion at your current monthly contribution.
          </p>
        </CardHeader>
        <CardContent>
          {d.goalsWithProjection.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No goals yet.
            </p>
          ) : (
            <ul className="space-y-5">
              {d.goalsWithProjection.map(({ goal, projection }) => {
                const reached = projection.progress >= 100;
                return (
                  <li
                    key={goal.id}
                    className="space-y-2 rounded-lg border border-border/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-medium">
                        {goal.name}
                        {reached ? (
                          <Badge variant="secondary">Reached 🎉</Badge>
                        ) : null}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatINR(goal.savedAmount)} /{" "}
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress value={projection.progress} />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{formatINR(projection.remaining)} remaining</span>
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="size-3.5" />
                        {projection.estimatedCompletion ? (
                          <>
                            {format(
                              projection.estimatedCompletion,
                              "MMMM yyyy"
                            )}
                            {projection.monthsToComplete
                              ? ` · in ${projection.monthsToComplete} month${
                                  projection.monthsToComplete === 1 ? "" : "s"
                                }`
                              : ""}
                          </>
                        ) : (
                          "Set a monthly contribution to project completion"
                        )}
                      </span>
                    </div>
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
