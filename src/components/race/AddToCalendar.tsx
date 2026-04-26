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
          캘린더에 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>캘린더 앱 선택</DialogTitle>
          <DialogDescription>"{raceName}"을(를) 원하는 캘린더에 추가하세요.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button asChild variant="outline" className="justify-start">
            <a href={gcal.toString()} target="_blank" rel="noopener noreferrer">
              <Calendar className="size-4" /> Google 캘린더
            </a>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <a href={`/api/ics/${editionId}`} download>
              <Download className="size-4" /> .ics 다운로드 (Apple, Outlook 등)
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
