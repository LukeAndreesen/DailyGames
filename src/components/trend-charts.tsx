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

export type EloComparisonSeries = {
  id: string;
  label: string;
  points: EloHistoryPoint[];
};

type ChartPoint = { date: string; value: number };

const PLAYER_COLORS = [
  "var(--brand)",
  "var(--pink)",
  "var(--cyan)",
  "var(--lime)",
  "var(--gold)",
  "#3b82f6",
  "#db2777",
  "#0f766e",
];

function playerColor(index: number): string {
  return PLAYER_COLORS[index] ?? `hsl(${Math.round((270 + index * 137.508) % 360)} 72% 52%)`;
}

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

export function EloComparisonChart({ series }: { series: EloComparisonSeries[] }) {
  const { chartData, chartSeries } = useMemo(() => {
    const rowsByDate = new Map<string, Record<string, string | number>>();
    const renderedSeries = series.map((item, index) => ({
      ...item,
      color: playerColor(index),
      dataKey: `player_${index}`,
    }));

    renderedSeries.forEach((item) => {
      item.points.forEach((point) => {
        const row = rowsByDate.get(point.date) ?? { date: point.date };
        row[item.dataKey] = point.rating;
        rowsByDate.set(point.date, row);
      });
    });

    return {
      chartData: [...rowsByDate.values()].sort((a, b) =>
        String(a.date).localeCompare(String(b.date)),
      ),
      chartSeries: renderedSeries,
    };
  }, [series]);

  if (!chartSeries.length) return null;

  return (
    <div>
      <div className="mt-4 h-80 w-full" role="img" aria-label="All players Elo over time chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
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
              formatter={(value, name) => [
                new Intl.NumberFormat("en-US").format(Number(value)),
                String(name),
              ]}
              labelFormatter={(label) => String(label)}
            />
            <ReferenceLine
              y={1000}
              stroke="var(--muted)"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
            />
            {chartSeries.map((item) => (
              <Line
                key={item.id}
                type="monotone"
                dataKey={item.dataKey}
                name={item.label}
                stroke={item.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul
        aria-label="Player color legend"
        className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-bold text-[var(--muted)]"
      >
        {chartSeries.map((item) => (
          <li key={item.id} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
