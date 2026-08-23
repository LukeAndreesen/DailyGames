"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EloHistoryPoint } from "@/lib/domain";

export type TrendSeries = {
  id: string;
  label: string;
  points: { date: string; score: number }[];
};

type ChartPoint = { date: string; value: number };

function Chart({
  points,
  valueLabel,
  ariaLabel,
  baseline,
}: {
  points: ChartPoint[];
  valueLabel: string;
  ariaLabel: string;
  baseline?: number;
}) {
  return (
    <div className="mt-4 h-64 w-full" role="img" aria-label={ariaLabel}>
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
            formatter={(value) => [
              new Intl.NumberFormat("en-US").format(Number(value)),
              valueLabel,
            ]}
            labelFormatter={(label) => String(label)}
          />
          {baseline === undefined ? null : (
            <ReferenceLine
              y={baseline}
              stroke="var(--muted)"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            name={valueLabel}
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
      <Chart
        points={active.points.map((point) => ({ date: point.date, value: point.score }))}
        valueLabel="Score"
        ariaLabel={`${active.label} score history chart`}
      />
    </div>
  );
}

export function EloTrendChart({ points }: { points: EloHistoryPoint[] }) {
  if (!points.length) return null;
  return (
    <Chart
      points={points.map((point) => ({ date: point.date, value: point.rating }))}
      valueLabel="Elo"
      ariaLabel="Elo rating over time chart"
      baseline={1000}
    />
  );
}
