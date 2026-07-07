"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR } from "@/lib/format";

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export function CategoryChart({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-48 place-items-center text-sm text-muted-foreground">
        No spending yet this month
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-48 w-48 shrink-0">
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
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                color: "var(--popover-foreground)",
                fontSize: "0.8rem",
              }}
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
