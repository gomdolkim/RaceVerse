import type { PrimaryType } from "@/lib/supabase/types";

export const PRIMARY_TYPES: PrimaryType[] = [
  "road_marathon",
  "road_other",
  "trail",
  "ultra",
  "mixed",
  "virtual",
  "unknown",
];

export const PRIMARY_TYPE_LABEL_KO: Record<PrimaryType, string> = {
  road_marathon: "로드 마라톤",
  road_other: "로드 (기타)",
  trail: "트레일",
  ultra: "울트라",
  mixed: "복합",
  virtual: "버추얼",
  unknown: "분류 미정",
};

export const PRIMARY_TYPE_BADGE: Record<PrimaryType, string> = {
  road_marathon: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  road_other: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  trail: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  ultra: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  mixed: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  virtual: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/30",
  unknown: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
};

export function distanceColor(km: number | null | undefined): string {
  if (km === null || km === undefined) return "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30";
  if (km <= 12) return "bg-sky-500/15 text-sky-300 ring-sky-500/30";
  if (km <= 22) return "bg-violet-500/15 text-violet-300 ring-violet-500/30";
  if (km <= 43) return "bg-orange-500/15 text-orange-300 ring-orange-500/30";
  return "bg-rose-500/15 text-rose-300 ring-rose-500/30";
}

export function distanceLabelKo(km: number | null | undefined): string {
  if (km === null || km === undefined) return "거리 미정";
  if (Math.abs(km - 42.195) < 0.5) return "마라톤";
  if (Math.abs(km - 21.0975) < 0.5) return "하프";
  if (Math.abs(km - 10) < 0.5) return "10K";
  if (Math.abs(km - 5) < 0.5) return "5K";
  if (km > 50) return "울트라";
  return `${km.toFixed(km % 1 === 0 ? 0 : 1)}km`;
}
