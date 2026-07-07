import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber, formatINR } from "@/lib/format";
import {
  CATEGORY_MAP,
  INCOME_TYPES,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Repeat, TrendingUp, TrendingDown, CalendarClock } from "lucide-react";
import { RecurringForm, type RecurringFormData } from "./recurring-form";
import { RecurringToggle } from "./recurring-toggle";
import { deleteRecurring } from "@/lib/actions/recurring";

export const dynamic = "force-dynamic";

const INCOME_TYPE_MAP = Object.fromEntries(
  INCOME_TYPES.map((t) => [t.value, t.label])
) as Record<string, string>;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default async function RecurringPage() {
  const user = await getCurrentUser();

  const templates = await prisma.recurringTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const activeCount = templates.filter((t) => t.active).length;
  const monthlyIncome = templates
    .filter((t) => t.kind === "INCOME" && t.active)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
  const monthlyExpense = templates
    .filter((t) => t.kind === "EXPENSE" && t.active)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Recurring"
        description="Salary, SIP, subscriptions — auto-posted on their day each month."
      >
        <RecurringForm />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active templates"
          value={String(activeCount)}
          icon={Repeat}
          hint={`${templates.length} total`}
        />
        <StatCard
          label="Monthly income"
          value={formatINR(monthlyIncome)}
          icon={TrendingUp}
          tone="positive"
        />
        <StatCard
          label="Monthly expense"
          value={formatINR(monthlyExpense)}
          icon={TrendingDown}
          tone="negative"
        />
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No recurring transactions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {templates.map((t) => {
            const isIncome = t.kind === "INCOME";
            const cat = t.category ? CATEGORY_MAP[t.category] : null;
            const tagLabel = isIncome
              ? t.incomeType
                ? INCOME_TYPE_MAP[t.incomeType] ?? t.incomeType
                : "Income"
              : cat
                ? `${cat.emoji} ${cat.label}`
                : "Expense";

            const formData: RecurringFormData = {
              id: t.id,
              kind: t.kind,
              label: t.label,
              amount: toNumber(t.amount),
              dayOfMonth: t.dayOfMonth,
              category: t.category,
              paymentMethod: t.paymentMethod,
              incomeType: t.incomeType,
              active: t.active,
            };

            return (
              <Card key={t.id} className={t.active ? undefined : "opacity-60"}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="truncate font-medium">{t.label}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={
                            isIncome
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          }
                        >
                          {isIncome ? "Income" : "Expense"}
                        </Badge>
                        <Badge variant="outline">{tagLabel}</Badge>
                      </div>
                    </div>
                    <span
                      className={
                        "shrink-0 text-lg font-semibold tracking-tight " +
                        (isIncome ? "text-emerald-500" : "text-rose-500")
                      }
                    >
                      {formatINR(toNumber(t.amount))}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    Day {t.dayOfMonth} of each month
                    {t.lastRunMonth ? (
                      <span>
                        {" "}
                        · last run {MONTHS[t.lastRunMonth - 1] ?? ""}
                        {t.lastRunYear ? ` ${t.lastRunYear}` : ""}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-2">
                      <RecurringToggle id={t.id} active={t.active} />
                      <span className="text-xs text-muted-foreground">
                        {t.active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RecurringForm recurring={formData} />
                      <DeleteButton
                        label="recurring"
                        onDelete={deleteRecurring.bind(null, t.id)}
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
