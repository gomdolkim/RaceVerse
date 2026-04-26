"use client";

import { countryName } from "@/lib/format/country";
import type { CountryStats, PrimaryType } from "@/lib/supabase/types";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("insights");
  const tType = useTranslations("primary_type");
  const locale = useLocale();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title={t("chart_monthly")} subtitle={t("chart_monthly_sub")}>
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

      <Card title={t("chart_types")} subtitle={t("chart_types_sub")}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={types.map((tt) => ({
                name: tType(tt.primary_type as PrimaryType),
                value: tt.count,
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

      <Card title={t("chart_distance")} subtitle={t("chart_distance_sub")}>
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

      <Card title={t("chart_top_countries")}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={topCountries.map((c) => ({
              name: countryName(c.country_code, locale, c.country_name),
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
