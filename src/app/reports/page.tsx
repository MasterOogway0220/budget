import { Download } from "lucide-react";
import { getReportData, type ReportData } from "@/lib/reports";
import { formatINR } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

type Summary = ReportData["monthly"];

function ReportSection({
  summary,
  title,
}: {
  summary: Summary;
  title: string;
}) {
  const { income, expenseTotal, savings, count, byCategory, biggest } = summary;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{title}</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <StatCard label="Income" value={formatINR(income)} tone="positive" />
          <StatCard
            label="Expenses"
            value={formatINR(expenseTotal)}
            tone="negative"
            hint={`${count} txns`}
          />
          <StatCard
            label="Savings"
            value={formatINR(savings)}
            tone={savings >= 0 ? "positive" : "negative"}
          />
        </div>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Category breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-4 pt-2">
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No spending yet.</p>
          ) : (
            byCategory.map((c) => {
              const pct =
                expenseTotal > 0 ? (c.amount / expenseTotal) * 100 : 0;
              return (
                <div key={c.category} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span>{c.emoji}</span>
                      <span className="truncate">{c.label}</span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatINR(c.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: c.color,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Biggest expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-4 pt-2">
          {biggest.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet.</p>
          ) : (
            biggest.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span>{e.emoji}</span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">
                      {e.description || e.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {e.date}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatINR(e.amount)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ReportsPage() {
  const { monthLabel, weekLabel, monthly, weekly } = await getReportData();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Reports"
        description={`Your money at a glance — ${monthLabel}.`}
      >
        <PrintButton />
        <Button
          variant="outline"
          render={<a href="/api/export?type=expenses&range=month" />}
        >
          <Download />
          Expenses CSV
        </Button>
        <Button
          variant="outline"
          render={<a href="/api/export?type=income&range=month" />}
        >
          <Download />
          Income CSV
        </Button>
      </PageHeader>

      <Tabs defaultValue="month">
        <TabsList className="w-full">
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>
        <TabsContent value="month" className="mt-4">
          <ReportSection summary={monthly} title={monthLabel} />
        </TabsContent>
        <TabsContent value="week" className="mt-4">
          <ReportSection summary={weekly} title={weekLabel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
