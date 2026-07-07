import { getAnalyticsData } from "@/lib/analytics";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryChart } from "@/components/dashboard/category-chart";
import {
  IncomeExpenseChart,
  SavingsChart,
  CompositionChart,
  InvestmentChart,
} from "./charts";
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const {
    monthlyTrend,
    categoryBreakdown,
    netWorthComposition,
    investmentBreakdown,
    netWorth,
    totalIncome6m,
    totalExpense6m,
    avgMonthlySavings,
  } = await getAnalyticsData();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Analytics"
        description="Trends across your money over the last 6 months."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="6-month Income"
          value={formatINR(totalIncome6m)}
          icon={TrendingUp}
          tone="positive"
        />
        <StatCard
          label="6-month Expenses"
          value={formatINR(totalExpense6m)}
          icon={TrendingDown}
          tone="negative"
        />
        <StatCard
          label="Avg Monthly Savings"
          value={formatINR(avgMonthlySavings)}
          icon={PiggyBank}
        />
        <StatCard
          label="Net Worth"
          value={formatINR(netWorth)}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={monthlyTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsChart data={monthlyTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={categoryBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Worth Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <CompositionChart data={netWorthComposition} />
          </CardContent>
        </Card>

        {investmentBreakdown.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Investments: Invested vs Current</CardTitle>
            </CardHeader>
            <CardContent>
              <InvestmentChart data={investmentBreakdown} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
