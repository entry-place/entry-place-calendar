import type { EntryPlaceCalendar, CalendarEvent } from '../api/types';
import { getLocalEventPath } from '../api/FetchCalendar';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '';

interface CalendarJsonLdProps {
  calendar: EntryPlaceCalendar;
  events: CalendarEvent[];
  url: string;
}

export function CalendarJsonLd({ calendar, events, url }: CalendarJsonLdProps) {
  const futureEvents = events.filter(e => e.isFutureEvent).slice(0, 10);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: calendar.name,
    description: calendar.description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: futureEvents.map((event, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          name: event.heading || event.subheading || 'Trials Event',
          startDate: new Date(event.dateTime * 1000).toISOString(),
          description: event.calendarComment || undefined,
          image: event.featuredImageLargeUrl || event.imageUrl || undefined,
          url: `${baseUrl}${getLocalEventPath(event)}`,
          location: event.subheading ? {
            '@type': 'Place',
            name: event.subheading,
          } : undefined,
          organizer: event.organiserName ? {
            '@type': 'Organization',
            name: event.organiserName,
          } : undefined,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
