import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber, formatINR } from "@/lib/format";
import { monthRange } from "@/lib/dates";
import { INCOME_TYPES } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DeleteButton } from "@/components/delete-button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IncomeForm, type IncomeFormData } from "./income-form";
import { deleteIncome } from "@/lib/actions/income";
import { Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

const INCOME_TYPE_MAP = Object.fromEntries(
  INCOME_TYPES.map((t) => [t.value, t.label])
) as Record<string, string>;

export default async function IncomePage() {
  const user = await getCurrentUser();
  const month = monthRange();

  const [incomes, monthAgg] = await Promise.all([
    prisma.income.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.income.aggregate({
      where: { userId: user.id, date: { gte: month.start, lte: month.end } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const monthTotal = toNumber(monthAgg._sum.amount);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Income"
        description="Every rupee that comes in, tracked by source."
      >
        <IncomeForm />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Income this month"
          value={formatINR(monthTotal)}
          icon={Wallet}
          tone="positive"
        />
        <StatCard
          label="Entries this month"
          value={String(monthAgg._count)}
          hint={`${incomes.length} shown`}
        />
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No income yet. Add your first one.
                </TableCell>
              </TableRow>
            )}
            {incomes.map((i) => {
              const formData: IncomeFormData = {
                id: i.id,
                source: i.source,
                amount: toNumber(i.amount),
                type: i.type,
                date: format(i.date, "yyyy-MM-dd"),
                recurring: i.recurring,
                note: i.note,
              };
              return (
                <TableRow key={i.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {format(i.date, "dd MMM")}
                  </TableCell>
                  <TableCell className="max-w-[16rem] truncate font-medium">
                    {i.source}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {INCOME_TYPE_MAP[i.type] ?? i.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {i.recurring ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-500">
                        Recurring
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatINR(toNumber(i.amount))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <IncomeForm income={formData} />
                      <DeleteButton
                        label="income"
                        onDelete={deleteIncome.bind(null, i.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
