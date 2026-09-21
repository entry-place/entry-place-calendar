"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import EventList from './EventList';
import { resolveCalendarColor } from '../utils/colorUtils';
import { CalendarJsonLd } from './CalendarJsonLd';
import { CalendarResponse } from '../api/types';

export default function CalendarPage({
  calendarResponse,
  colorParam,
  inlineAds,
  subscribeSlot,
}: {
  calendarResponse: CalendarResponse;
  colorParam?: string;
  /**
   * Inline sponsor ads between event rows. `org` is the club's organiser
   * slug: ads are fetched and view/click events recorded against it, so it
   * travels with the handles rather than being defaulted. Omit the whole
   * object for no ads.
   */
  inlineAds?: { org: string; handles: string[] };
  /**
   * Rendered under the calendar title. The host site supplies its own
   * subscribe control here (a newsletter form, or nothing).
   */
  subscribeSlot?: ReactNode;
}) {
  // Before the early return: hooks cannot run conditionally.
  const pathname = usePathname();

  if (!calendarResponse.calendar) {
    return <div>Calendar not found</div>;
  }

  const calendarColor = resolveCalendarColor(calendarResponse.calendar, colorParam);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
  const allEvents = calendarResponse.data.flatMap(group => group.events);
  // The route the host renders this on, not a path the package invents: the
  // JSON-LD CollectionPage url has to be a page that exists.
  const calendarUrl = `${baseUrl}${pathname}`;

  return (
    <>
      <CalendarJsonLd
        calendar={calendarResponse.calendar}
        events={allEvents}
        url={calendarUrl}
      />

      {/* Title and Subscribe Section */}
      <div className="flex flex-col items-start justify-between mt-8">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: `var(--color-${calendarColor})`, fontFamily: 'Archivo', fontVariationSettings: '"wdth" 62', fontWeight: 700 }}>Calendar</p>
          <h1 className="mt-0 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {calendarResponse.calendar.name}
          </h1>
          {calendarResponse.calendar.description && (
            <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
              {calendarResponse.calendar.description}
            </p>
          )}
        </div>

        {subscribeSlot && (
          <div className="flex items-center gap-2 pt-6 pb-2">
            {subscribeSlot}
          </div>
        )}
      </div>

      {/* Calendar Content — pull to screen edges on mobile */}
      <div className="mt-8 -mx-6 md:mx-0">
        <EventList
          calendar={calendarResponse.calendar}
          yearMonthEventGroups={calendarResponse.data}
          isEmbedded={false}
          calendarColor={calendarColor}
          heading='Calendar'
          inlineAds={inlineAds}
        />
      </div>
    </>
  );
}
