"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Download } from "lucide-react";
import { useTranslations } from "next-intl";

export function AddToCalendar({
  raceName,
  editionId,
  startDate,
  endDate,
  location,
}: {
  raceName: string;
  editionId: string;
  startDate: string;
  endDate?: string | null;
  location?: string;
}) {
  const t = useTranslations("race_detail");
  const start = startDate.replace(/-/g, "");
  const end = (endDate ?? startDate).replace(/-/g, "");
  const gcal = new URL("https://calendar.google.com/calendar/render");
  gcal.searchParams.set("action", "TEMPLATE");
  gcal.searchParams.set("text", raceName);
  gcal.searchParams.set("dates", `${start}/${end}`);
  if (location) gcal.searchParams.set("location", location);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Calendar className="size-3.5" />
          {t("add_to_calendar")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("add_to_calendar_pick")}</DialogTitle>
          <DialogDescription>{t("add_to_calendar_desc", { name: raceName })}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button asChild variant="outline" className="justify-start">
            <a href={gcal.toString()} target="_blank" rel="noopener noreferrer">
              <Calendar className="size-4" /> {t("calendar_google")}
            </a>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <a href={`/api/ics/${editionId}`} download>
              <Download className="size-4" /> {t("calendar_ics")}
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
