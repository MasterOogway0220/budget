import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber, formatINR, formatPercent } from "@/lib/format";
import { computeGoalProjection } from "@/lib/finance";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DeleteButton } from "@/components/delete-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, PiggyBank, TrendingUp } from "lucide-react";
import { GoalForm, type GoalFormData } from "./goal-form";
import { Contribute } from "./contribute";
import { deleteGoal } from "@/lib/actions/goals";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const user = await getCurrentUser();

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const totalTarget = goals.reduce((acc, g) => acc + toNumber(g.targetAmount), 0);
  const totalSaved = goals.reduce((acc, g) => acc + toNumber(g.savedAmount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Goals"
        description="Save towards what matters, one contribution at a time."
      >
        <GoalForm />
      </PageHeader>

      {goals.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total target"
            value={formatINR(totalTarget)}
            icon={Target}
          />
          <StatCard
            label="Total saved"
            value={formatINR(totalSaved)}
            icon={PiggyBank}
            tone="positive"
          />
          <StatCard
            label="Overall progress"
            value={formatPercent(overallProgress)}
            icon={TrendingUp}
          />
        </div>
      )}

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No goals yet. Add your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const target = toNumber(g.targetAmount);
            const saved = toNumber(g.savedAmount);
            const monthly = toNumber(g.monthlyContribution);
            const projection = computeGoalProjection(target, saved, monthly);
            const isDone = g.completed || projection.progress >= 100;

            const formData: GoalFormData = {
              id: g.id,
              name: g.name,
              targetAmount: target,
              savedAmount: saved,
              monthlyContribution: monthly,
              deadline: g.deadline ? format(g.deadline, "yyyy-MM-dd") : null,
            };

            return (
              <Card key={g.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {g.name}
                    {isDone && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-500">
                        Completed 🎉
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{formatINR(saved)}</span>
                    <span className="text-muted-foreground">
                      of {formatINR(target)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Progress value={projection.progress} className="flex-1" />
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatPercent(projection.progress)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">
                        {formatINR(projection.remaining)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Monthly</span>
                      <span className="font-medium">{formatINR(monthly)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">
                        Est. completion
                      </span>
                      <span className="font-medium">
                        {projection.estimatedCompletion
                          ? format(projection.estimatedCompletion, "MMM yyyy")
                          : "Set a monthly contribution"}
                      </span>
                    </div>
                    {g.deadline && (
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Deadline</span>
                        <span className="font-medium">
                          {format(g.deadline, "MMM yyyy")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Contribute goalId={g.id} />
                    <div className="flex items-center gap-1">
                      <GoalForm goal={formData} />
                      <DeleteButton
                        label="goal"
                        onDelete={deleteGoal.bind(null, g.id)}
                      />
                    </div>
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
