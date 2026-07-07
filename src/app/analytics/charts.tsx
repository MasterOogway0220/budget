"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/format";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
  fontSize: "0.8rem",
} as const;

const axisProps = {
  stroke: "var(--muted-foreground)",
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

function EmptyChart({ label = "No data yet" }: { label?: string }) {
  return (
    <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface InvestmentPoint {
  name: string;
  invested: number;
  currentValue: number;
}

export interface CompositionSlice {
  name: string;
  value: number;
  color: string;
}

export function IncomeExpenseChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis
          {...axisProps}
          width={44}
          tickFormatter={(v) => formatINR(Number(v), { compact: true })}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.3 }}
          formatter={(value) => formatINR(Number(value))}
          contentStyle={tooltipStyle}
        />
        <Bar dataKey="income" name="Income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expenses" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SavingsChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis
          {...axisProps}
          width={44}
          tickFormatter={(v) => formatINR(Number(v), { compact: true })}
        />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          formatter={(value) => formatINR(Number(value))}
          contentStyle={tooltipStyle}
        />
        <Area
          type="monotone"
          dataKey="savings"
          name="Savings"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#savingsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CompositionChart({ data }: { data: CompositionSlice[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-[240px] w-full sm:w-48 sm:shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatINR(Number(value))}
              contentStyle={tooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid flex-1 gap-2">
        {data.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="flex-1 text-muted-foreground">{slice.name}</span>
            <span className="font-medium">{formatINR(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InvestmentChart({ data }: { data: InvestmentPoint[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis
          {...axisProps}
          width={44}
          tickFormatter={(v) => formatINR(Number(v), { compact: true })}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.3 }}
          formatter={(value) => formatINR(Number(value))}
          contentStyle={tooltipStyle}
        />
        <Legend
          wrapperStyle={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}
        />
        <Bar dataKey="invested" name="Invested" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
        <Bar
          dataKey="currentValue"
          name="Current"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
