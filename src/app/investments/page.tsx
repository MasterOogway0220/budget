import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber, formatINR, formatPercent } from "@/lib/format";
import { INVESTMENT_TYPES, SIP_MONTHLY_TARGET } from "@/lib/constants";
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
import { InvestmentForm, type InvestmentFormData } from "./investment-form";
import { deleteInvestment } from "@/lib/actions/investments";
import { TrendingUp, Wallet, LineChart, PiggyBank } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_LABELS = Object.fromEntries(
  INVESTMENT_TYPES.map((t) => [t.value, t.label])
) as Record<string, string>;

export default async function InvestmentsPage() {
  const user = await getCurrentUser();

  const investments = await prisma.investment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const totalInvested = investments.reduce(
    (sum, i) => sum + toNumber(i.invested),
    0
  );
  const currentValue = investments.reduce(
    (sum, i) => sum + toNumber(i.currentValue),
    0
  );
  const totalReturns = currentValue - totalInvested;
  const returnPct = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
  const monthlySip = investments
    .filter((i) => i.type === "SIP")
    .reduce((sum, i) => sum + toNumber(i.monthlySip), 0);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Investments"
        description="Your portfolio, invested value and returns at a glance."
      >
        <InvestmentForm />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Invested"
          value={formatINR(totalInvested)}
          icon={Wallet}
        />
        <StatCard
          label="Current Value"
          value={formatINR(currentValue)}
          icon={LineChart}
        />
        <StatCard
          label="Returns"
          value={formatINR(totalReturns)}
          icon={TrendingUp}
          tone={totalReturns >= 0 ? "positive" : "negative"}
          hint={formatPercent(returnPct)}
        />
        <StatCard
          label="Monthly SIP"
          value={formatINR(monthlySip)}
          icon={PiggyBank}
          hint={`Target ${formatINR(SIP_MONTHLY_TARGET)}`}
        />
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Invested</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
              <TableHead className="text-right">Returns</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No investments yet. Add your first one.
                </TableCell>
              </TableRow>
            )}
            {investments.map((i) => {
              const invested = toNumber(i.invested);
              const current = toNumber(i.currentValue);
              const rowReturns = current - invested;
              const rowPct = invested > 0 ? (rowReturns / invested) * 100 : 0;
              const positive = rowReturns >= 0;
              const formData: InvestmentFormData = {
                id: i.id,
                name: i.name,
                type: i.type,
                invested,
                currentValue: current,
                monthlySip: toNumber(i.monthlySip),
              };
              return (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {TYPE_LABELS[i.type] ?? i.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatINR(invested)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatINR(current)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      positive ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {formatINR(rowReturns)}
                    <span className="ml-1 text-xs font-normal">
                      ({formatPercent(rowPct)})
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <InvestmentForm investment={formData} />
                      <DeleteButton
                        label="investment"
                        onDelete={deleteInvestment.bind(null, i.id)}
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
