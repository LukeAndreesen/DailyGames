"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendSeries = {
  id: string;
  label: string;
  points: { date: string; score: number }[];
};

function Chart({ points }: { points: { date: string; score: number }[] }) {
  return (
    <div className="mt-4 h-64 w-full" aria-label="Score history chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => value.slice(5)}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={["dataMin - 10", "dataMax + 10"]}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-strong)",
              border: "1px solid var(--line)",
              borderRadius: "14px",
              color: "var(--ink)",
            }}
            formatter={(value) => [new Intl.NumberFormat("en-US").format(Number(value)), "Score"]}
            labelFormatter={(label) => String(label)}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--brand)"
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--brand)" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SelectableTrendChart({
  series,
  selectLabel = "Player",
}: {
  series: TrendSeries[];
  selectLabel?: string;
}) {
  const [selected, setSelected] = useState(series[0]?.id ?? "");
  const active = useMemo(
    () => series.find((item) => item.id === selected) ?? series[0],
    [selected, series],
  );
  if (!active) return null;
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
        {selectLabel}
        <select
          value={active.id}
          onChange={(event) => setSelected(event.target.value)}
          className="mt-2 block min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 text-base font-bold text-[var(--ink)]"
        >
          {series.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <Chart points={active.points} />
    </div>
  );
}
