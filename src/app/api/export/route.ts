import { NextRequest } from "next/server";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber } from "@/lib/format";
import { monthRange } from "@/lib/dates";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => csvEscape(c ?? "")).join(",")).join("\n");
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "expenses";
  const range = req.nextUrl.searchParams.get("range") ?? "month";
  const user = await getCurrentUser();

  const where =
    range === "month"
      ? { userId: user.id, date: { gte: monthRange().start, lte: monthRange().end } }
      : { userId: user.id };

  let rows: string[][];
  let filename: string;

  if (type === "income") {
    const items = await prisma.income.findMany({ where, orderBy: { date: "desc" } });
    rows = [
      ["Date", "Source", "Type", "Recurring", "Amount"],
      ...items.map((i) => [
        format(i.date, "yyyy-MM-dd"),
        i.source,
        i.type,
        i.recurring ? "Yes" : "No",
        String(toNumber(i.amount)),
      ]),
    ];
    filename = `income-${range}.csv`;
  } else {
    const items = await prisma.expense.findMany({ where, orderBy: { date: "desc" } });
    rows = [
      ["Date", "Category", "Description", "Payment", "Tags", "Amount"],
      ...items.map((e) => [
        format(e.date, "yyyy-MM-dd"),
        e.category,
        e.description ?? "",
        e.paymentMethod,
        e.tags.join(" "),
        String(toNumber(e.amount)),
      ]),
    ];
    filename = `expenses-${range}.csv`;
  }

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
