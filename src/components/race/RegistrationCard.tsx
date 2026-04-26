"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/format/date";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { formatNumber, formatPrice } from "@/lib/utils";
import { AlertCircle, ExternalLink, Ticket, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export function RegistrationCard({ race }: { race: RaceWithNextEdition }) {
  const locale = useLocale();
  const t = useTranslations("race_detail");
  const hasReg = !!race.registration_url;

  return (
    <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden">
      <div className="bg-gradient-to-br from-accent/15 to-transparent p-6 border-b border-border">
        <h2 className="font-display text-2xl tracking-tight">{t("registration")}</h2>
        {race.registration_platform && (
          <p className="mt-1 text-sm text-fg-muted">
            {t("registration_via", { platform: race.registration_platform })}
          </p>
        )}
      </div>
      <div className="p-6 space-y-5">
        {!hasReg ? (
          <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4">
            <AlertCircle className="size-4 text-fg-subtle mt-0.5" />
            <div>
              <p className="text-sm font-medium">{t("registration_unknown")}</p>
              <p className="mt-1 text-xs text-fg-muted leading-relaxed">
                {t("registration_unknown_hint")}
              </p>
              {race.website_url && (
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <a href={race.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    {t("registration_unknown_cta")}
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <Button asChild size="lg" className="w-full">
              <a href={race.registration_url!} target="_blank" rel="noopener noreferrer">
                <Ticket className="size-4" />
                {t("registration_url")}
                <ExternalLink className="size-3.5 opacity-70" />
              </a>
            </Button>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              {race.registration_opens_at && (
                <div>
                  <dt className="text-fg-subtle text-xs">{t("registration_opens_at")}</dt>
                  <dd className="mt-0.5 tabular text-fg">
                    {formatEventDate(race.registration_opens_at, undefined, locale)}
                  </dd>
                </div>
              )}
              {race.registration_closes_at && (
                <div>
                  <dt className="text-fg-subtle text-xs">{t("registration_closes_at")}</dt>
                  <dd className="mt-0.5 tabular text-fg">
                    {formatEventDate(race.registration_closes_at, undefined, locale)}
                  </dd>
                </div>
              )}
              {race.early_bird_price !== null && race.early_bird_price !== undefined && (
                <div>
                  <dt className="text-fg-subtle text-xs">{t("early_bird")}</dt>
                  <dd className="mt-0.5 tabular text-fg">
                    {formatPrice(race.early_bird_price, race.price_currency, locale)}
                  </dd>
                </div>
              )}
              {race.price_amount !== null && race.price_amount !== undefined && (
                <div>
                  <dt className="text-fg-subtle text-xs">{t("regular_price")}</dt>
                  <dd className="mt-0.5 tabular text-fg">
                    {formatPrice(race.price_amount, race.price_currency, locale)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap gap-2">
              {race.lottery_required && <Badge variant="warning">{t("registration_lottery")}</Badge>}
              {race.qualifying_time_required && (
                <Badge variant="warning">{t("registration_qualifying")}</Badge>
              )}
              {race.waitlist_available && (
                <Badge variant="default" className="gap-1">
                  <Users className="size-3" /> {t("registration_waitlist")}
                </Badge>
              )}
            </div>

            {race.how_to_register && (
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-medium text-fg-subtle mb-1">{t("registration_guide")}</p>
                <p className="text-sm leading-relaxed text-fg-muted whitespace-pre-line">
                  {race.how_to_register}
                </p>
              </div>
            )}
          </>
        )}

        {race.participant_limit && (
          <p className="text-xs text-fg-subtle tabular">
            {t("participant_limit", { n: formatNumber(race.participant_limit, locale) })}
            {race.registered_count !== null &&
              race.registered_count !== undefined &&
              ` · ${t("registered_count", { n: formatNumber(race.registered_count, locale) })}`}
          </p>
        )}
      </div>
    </div>
  );
}
