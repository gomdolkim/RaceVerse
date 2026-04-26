import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/format/date";
import type { RaceWithNextEdition } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils";
import { AlertCircle, ExternalLink, Ticket, Users } from "lucide-react";

export function RegistrationCard({ race }: { race: RaceWithNextEdition }) {
  const hasReg = !!race.registration_url;

  return (
    <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden">
      <div className="bg-gradient-to-br from-accent/15 to-transparent p-6 border-b border-border">
        <h2 className="font-display text-2xl tracking-tight">등록 정보</h2>
        {race.registration_platform && (
          <p className="mt-1 text-sm text-fg-muted">via {race.registration_platform}</p>
        )}
      </div>
      <div className="p-6 space-y-5">
        {!hasReg ? (
          <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4">
            <AlertCircle className="size-4 text-fg-subtle mt-0.5" />
            <div>
              <p className="text-sm font-medium">등록 정보가 아직 수집되지 않았습니다</p>
              <p className="mt-1 text-xs text-fg-muted leading-relaxed">
                공식 사이트나 주최자 안내를 확인해주세요.
              </p>
              {race.website_url && (
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <a href={race.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    공식 사이트
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
                공식 등록
                <ExternalLink className="size-3.5 opacity-70" />
              </a>
            </Button>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              {race.registration_opens_at && (
                <div>
                  <dt className="text-fg-subtle text-xs">등록 시작</dt>
                  <dd className="mt-0.5 tabular text-fg">
                    {formatEventDate(race.registration_opens_at)}
                  </dd>
                </div>
              )}
              {race.registration_closes_at && (
                <div>
                  <dt className="text-fg-subtle text-xs">등록 마감</dt>
                  <dd className="mt-0.5 tabular text-fg">
                    {formatEventDate(race.registration_closes_at)}
                  </dd>
                </div>
              )}
              {race.early_bird_price !== null && race.early_bird_price !== undefined && (
                <div>
                  <dt className="text-fg-subtle text-xs">얼리버드</dt>
                  <dd className="mt-0.5 tabular text-fg">
                    {formatPrice(race.early_bird_price, race.price_currency)}
                  </dd>
                </div>
              )}
              {race.price_amount !== null && race.price_amount !== undefined && (
                <div>
                  <dt className="text-fg-subtle text-xs">정상가</dt>
                  <dd className="mt-0.5 tabular text-fg">
                    {formatPrice(race.price_amount, race.price_currency)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap gap-2">
              {race.lottery_required && <Badge variant="warning">추첨 필수</Badge>}
              {race.qualifying_time_required && <Badge variant="warning">기록 인증 필요</Badge>}
              {race.waitlist_available && (
                <Badge variant="default" className="gap-1">
                  <Users className="size-3" /> 대기열 가능
                </Badge>
              )}
            </div>

            {race.how_to_register && (
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-medium text-fg-subtle mb-1">참가 안내</p>
                <p className="text-sm leading-relaxed text-fg-muted whitespace-pre-line">
                  {race.how_to_register}
                </p>
              </div>
            )}
          </>
        )}

        {race.participant_limit && (
          <p className="text-xs text-fg-subtle tabular">
            정원 {race.participant_limit.toLocaleString()}명
            {race.registered_count !== null &&
              race.registered_count !== undefined &&
              ` · 등록 ${race.registered_count.toLocaleString()}명`}
          </p>
        )}
      </div>
    </div>
  );
}
