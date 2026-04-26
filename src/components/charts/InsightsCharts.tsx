"use client";

import { countryNameKo } from "@/lib/format/country";
import { PRIMARY_TYPE_LABEL_KO } from "@/lib/format/race";
import type { CountryStats, PrimaryType } from "@/lib/supabase/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ACCENT = "oklch(0.745 0.16 28)";
const PALETTE = [
  "oklch(0.745 0.16 28)",
  "oklch(0.7 0.16 158)",
  "oklch(0.78 0.16 70)",
  "oklch(0.62 0.18 280)",
  "oklch(0.65 0.18 200)",
  "oklch(0.7 0.16 320)",
  "oklch(0.55 0.12 280)",
];

interface Props {
  monthly: { month: string; count: number }[];
  types: { primary_type: string; count: number }[];
  distances: { bucket: string; count: number }[];
  topCountries: CountryStats[];
}

export function InsightsCharts({ monthly, types, distances, topCountries }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="월별 대회 일정" subtitle="향후 6개월 분포">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border) / 0.5)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "oklch(var(--fg-muted))" }}
              stroke="oklch(var(--border-strong))"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(var(--fg-muted))" }}
              stroke="oklch(var(--border-strong))"
            />
            <Tooltip
              contentStyle={{
                background: "oklch(var(--surface-overlay))",
                border: "1px solid oklch(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={ACCENT}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="종목별 분포" subtitle="primary_type 기준">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={types.map((t) => ({
                name: PRIMARY_TYPE_LABEL_KO[t.primary_type as PrimaryType] ?? t.primary_type,
                value: t.count,
              }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
            >
              {types.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 11 }}
              formatter={(v) => <span style={{ color: "oklch(var(--fg-muted))" }}>{v}</span>}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(var(--surface-overlay))",
                border: "1px solid oklch(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="거리 분포" subtitle="race_distances 기준">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={distances}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border) / 0.5)" />
            <XAxis
              dataKey="bucket"
              tick={{ fontSize: 11, fill: "oklch(var(--fg-muted))" }}
              stroke="oklch(var(--border-strong))"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(var(--fg-muted))" }}
              stroke="oklch(var(--border-strong))"
            />
            <Tooltip
              contentStyle={{
                background: "oklch(var(--surface-overlay))",
                border: "1px solid oklch(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" fill={ACCENT} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="대회 수 상위 국가">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={topCountries.map((c) => ({
              name: countryNameKo(c.country_code, c.country_name),
              value: c.race_count,
            }))}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border) / 0.5)" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "oklch(var(--fg-muted))" }}
              stroke="oklch(var(--border-strong))"
            />
            <YAxis
              dataKey="name"
              type="category"
              width={84}
              tick={{ fontSize: 11, fill: "oklch(var(--fg-muted))" }}
              stroke="oklch(var(--border-strong))"
            />
            <Tooltip
              contentStyle={{
                background: "oklch(var(--surface-overlay))",
                border: "1px solid oklch(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" fill={ACCENT} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-raised p-5">
      <header className="mb-4">
        <h2 className="font-display text-lg tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-fg-subtle">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
