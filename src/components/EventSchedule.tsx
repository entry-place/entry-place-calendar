"use client";

import { useState, useEffect, useMemo } from "react";
import { EventSchedule as EventScheduleType, EventScheduleItem } from "../api/FetchEvent";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

interface EventScheduleProps {
  schedules: EventScheduleType[];
  timezone?: string;
}

function getTimezoneAbbr(timezone?: string): string | null {
  if (!timezone) return null;
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: timezone,
    timeZoneName: "short",
  }).formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value ?? null;
}

function parseTime(iso: string): Date {
  return new Date(iso);
}

function formatTime(iso: string, timezone?: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(date).replace(/:00/, "");
}

function formatTimeRange(startsAt: string, endsAt: string, timezone?: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...(timezone ? { timeZone: timezone } : {}),
  };
  const fmt = new Intl.DateTimeFormat("en-AU", opts);
  const start = fmt.format(new Date(startsAt)).replace(/:00/, "");
  const end = fmt.format(new Date(endsAt)).replace(/:00/, "");
  return `${start} – ${end}`;
}

function getItemStatus(
  item: EventScheduleItem,
  now: Date,
  isLive: boolean
): "upcoming" | "in-progress" | "completed" {
  if (!isLive) return "upcoming";
  const start = parseTime(item.starts_at);
  if (item.ends_at) {
    const end = parseTime(item.ends_at);
    if (now >= end) return "completed";
    if (now >= start) return "in-progress";
    return "upcoming";
  }
  if (now >= start) return "completed";
  return "upcoming";
}

function getProgress(item: EventScheduleItem, now: Date): number {
  if (!item.ends_at) return 0;
  const start = parseTime(item.starts_at).getTime();
  const end = parseTime(item.ends_at).getTime();
  const current = now.getTime();
  if (current <= start) return 0;
  if (current >= end) return 1;
  return (current - start) / (end - start);
}

function todayDateString(timezone?: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(new Date());
}

function ScheduleItemList({
  schedule,
  now,
  isLive,
  timezone,
}: {
  schedule: EventScheduleType;
  now: Date;
  isLive: boolean;
  timezone?: string;
}) {
  return (
    <div className="rounded-md border border-gray-200 divide-y divide-gray-100 overflow-hidden">
      {schedule.items.map((item, i) => {
        const status = getItemStatus(item, now, isLive);
        const isRange = item.ends_at !== null;
        const progress = isRange ? getProgress(item, now) : 0;

        return (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 transition-colors ${
              status === "in-progress"
                ? "bg-indigo-50/50"
                : status === "completed"
                ? "bg-gray-50/50"
                : ""
            }`}
          >
            {/* Timeline marker — only in live mode */}
            {isLive && (
              <div className="pt-0.5 shrink-0 w-4 flex justify-center">
                {status === "completed" ? (
                  <CheckCircleIcon className="w-3.5 h-3.5 text-gray-300" />
                ) : status === "in-progress" ? (
                  <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                ) : (
                  <span
                    className={`mt-1 inline-block w-2 h-2 rounded-full bg-gray-300`}
                  />
                )}
              </div>
            )}

            {/* Time */}
            <div
              className={`w-28 sm:w-32 shrink-0 text-xs tabular-nums text-right ${
                status === "completed" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {isRange
                ? formatTimeRange(item.starts_at, item.ends_at!, timezone)
                : formatTime(item.starts_at, timezone)}
            </div>

            {/* Label + progress */}
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm inline-flex items-center gap-1.5 ${
                  status === "completed"
                    ? "text-gray-400"
                    : status === "in-progress"
                    ? "font-semibold text-indigo-600"
                    : item.is_highlighted
                    ? "font-semibold text-gray-900"
                    : "text-gray-900"
                }`}
              >
                {item.label}
              </span>

              {isRange && isLive && status === "in-progress" && (
                <div className="mt-1 h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-linear bg-indigo-500"
                    style={{ width: `${Math.min(progress * 100, 100)}%` }}
                  />
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}

const EventSchedule: React.FC<EventScheduleProps> = ({ schedules, timezone }) => {
  const today = todayDateString(timezone);
  const isLive = schedules.some((s) => s.date === today);

  const initialIndex = useMemo(() => {
    const todayIdx = schedules.findIndex((s) => s.date === today);
    return todayIdx >= 0 ? todayIdx : 0;
  }, [schedules, today]);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, [isLive]);

  if (!schedules || schedules.length === 0) return null;

  const schedule = schedules[selectedIndex];
  const isSingle = schedules.length === 1;
  const isDual = schedules.length === 2;
  const isMany = schedules.length > 2;
  const tzAbbr = getTimezoneAbbr(timezone);

  const scheduleHeading = (label: string) => (
    <h4 className="text-base font-medium text-gray-600">
      {label}{tzAbbr && <span className="ml-1.5 text-xs font-normal text-gray-400">{tzAbbr} timezone</span>}
    </h4>
  );

  // Single schedule
  if (isSingle) {
    return (
      <div className="mb-6 md:mb-12">
        {scheduleHeading(schedule.title || "Schedule")}
        <div className="mt-2">
          <ScheduleItemList schedule={schedule} now={now} isLive={isLive && schedule.date === today} timezone={timezone} />
        </div>
      </div>
    );
  }

  // Two schedules — side by side on desktop, pills on mobile
  if (isDual) {
    return (
      <div className="mb-6 md:mb-12">
        {scheduleHeading("Schedule")}

        {/* Mobile: pill selector */}
        <div className="mt-2 flex gap-2 flex-wrap md:hidden">
          {schedules.map((s, i) => (
            <button
              key={s.date}
              onClick={() => setSelectedIndex(i)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                i === selectedIndex
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="mt-2 md:hidden">
          <ScheduleItemList schedule={schedule} now={now} isLive={isLive && schedule.date === today} timezone={timezone} />
        </div>

        {/* Desktop: side by side */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-4 mt-2">
          {schedules.map((s) => (
            <div key={s.date}>
              {s.title && (
                <p className="text-sm font-medium text-gray-500 mb-1.5">{s.title}</p>
              )}
              <ScheduleItemList schedule={s} now={now} isLive={isLive && s.date === today} timezone={timezone} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3+ schedules — pills always
  return (
    <div className="mb-6 md:mb-12">
      {scheduleHeading("Schedule")}

      <div className="mt-2 flex gap-2 flex-wrap">
        {schedules.map((s, i) => (
          <button
            key={s.date}
            onClick={() => setSelectedIndex(i)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              i === selectedIndex
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="mt-2">
        <ScheduleItemList schedule={schedule} now={now} isLive={isLive && schedule.date === today} timezone={timezone} />
      </div>
    </div>
  );
};

export default EventSchedule;
