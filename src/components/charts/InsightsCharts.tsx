"use client";

import { countryName } from "@/lib/format/country";
import type { CountryAgg, DistanceBucket, MonthlyDistribution, TypeDistribution } from "@/lib/queries/stats";
import type { PrimaryType } from "@/lib/supabase/types";
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

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "oklch(var(--surface-overlay))",
  border: "1px solid oklch(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const TICK = { fontSize: 11, fill: "oklch(var(--fg-muted))" };
const STROKE = "oklch(var(--border-strong))";

interface Props {
  monthly: MonthlyDistribution[];
  types: TypeDistribution[];
  distances: DistanceBucket[];
  topCountries: CountryAgg[];
}

export function InsightsCharts({ monthly, types, distances, topCountries }: Props) {
  const t = useTranslations("insights");
  const tType = useTranslations("primary_type");
  const locale = useLocale();

  // Format month label as YYYY.MM (KO) or YYYY-MM (EN). Avoids long ticks.
  const monthlyData = monthly.map((m) => {
    const [year, month] = m.month.split("-");
    return {
      label: t("month_short", { year, month }),
      count: m.count,
    };
  });

  const typeData = types.map((tt) => ({
    name: tType(tt.primary_type as PrimaryType),
    value: tt.count,
  }));

  const distanceData = [...distances]
    .sort((a, b) => a.order - b.order)
    .map((d) => ({
      name: t(d.bucketKey as never),
      count: d.count,
    }));

  const countryData = topCountries.map((c) => ({
    name: countryName(c.country_code, locale, c.country_name),
    value: c.race_count,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title={t("chart_monthly")} subtitle={t("chart_monthly_sub")}>
        {monthlyData.length === 0 ? (
          <EmptyChart label={t("chart_no_data")} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border) / 0.5)" />
              <XAxis
                dataKey="label"
                tick={TICK}
                stroke={STROKE}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={TICK}
                stroke={STROKE}
                allowDecimals={false}
                width={36}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }} />
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
        )}
      </Card>

      <Card title={t("chart_types")} subtitle={t("chart_types_sub")}>
        {typeData.length === 0 ? (
          <EmptyChart label={t("chart_no_data")} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {typeData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
                formatter={(v) => <span style={{ color: "oklch(var(--fg-muted))" }}>{v}</span>}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title={t("chart_distance")} subtitle={t("chart_distance_sub")}>
        {distanceData.every((d) => d.count === 0) ? (
          <EmptyChart label={t("chart_no_data")} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distanceData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border) / 0.5)" />
              <XAxis dataKey="name" tick={TICK} stroke={STROKE} />
              <YAxis tick={TICK} stroke={STROKE} allowDecimals={false} width={36} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "oklch(var(--accent) / 0.08)" }} />
              <Bar dataKey="count" fill={ACCENT} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title={t("chart_top_countries")} subtitle={t("chart_top_countries_sub")}>
        {countryData.length === 0 ? (
          <EmptyChart label={t("chart_no_data")} />
        ) : (
          <ResponsiveContainer
            width="100%"
            height={Math.max(260, countryData.length * 24 + 40)}
          >
            <BarChart
              data={countryData}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border) / 0.5)"
                horizontal={false}
              />
              <XAxis type="number" tick={TICK} stroke={STROKE} allowDecimals={false} />
              <YAxis
                dataKey="name"
                type="category"
                width={110}
                tick={TICK}
                stroke={STROKE}
                interval={0}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "oklch(var(--accent) / 0.08)" }} />
              <Bar dataKey="value" fill={ACCENT} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
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

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-[260px] place-items-center rounded-lg border border-dashed border-border text-sm text-fg-subtle">
      {label}
    </div>
  );
}
