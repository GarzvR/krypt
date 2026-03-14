"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EnvironmentLoadChartProps = {
  data: Array<{
    id: string;
    environmentName: string;
    projectName: string;
    projectSlug: string;
    secrets: number;
  }>;
};

const BAR_COLORS = ["#65e0c7", "#55c8d8", "#7ab6ff", "#91e6be", "#4db2ff", "#79dbc8"];

export function EnvironmentLoadChart({ data }: EnvironmentLoadChartProps) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="environmentName"
            tick={{ fill: "#8ba0bb", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#8ba0bb", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{
              backgroundColor: "#091523",
              border: "1px solid rgba(167, 203, 255, 0.18)",
              borderRadius: "0px",
              color: "#edf5ff",
            }}
            labelStyle={{ color: "#edf5ff", fontWeight: 600 }}
          />
          <Bar dataKey="secrets" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.id} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
