import axios from './axios';
import { entryPlaceApiHeaders } from './credentials';

export interface RosterGroup {
  roster_id: number;
  event_roster_id: number;
  event_session_id: number | null;
  event_id: number;
  name: string;
  positions: RosterPosition[];
}

export interface RosterPosition {
  position_id: number;
  position_name: string;
  is_required: boolean;
  contacts: RosterContact[];
}

export interface RosterContact {
  id: number;
  contact_id: number;
  first_name: string;
  last_name: string;
}
  export interface CalendarEvent {
    id: number
    uuid: string
    heading: string | null;
    subheading: string | null
    yearWeek: number
    monthYear: string
    isSession: boolean
    isFutureEvent: boolean
    imageUrl: string
    date: string
    dateTime: number
    eventPath: string
    urlKey: string
    eventSlug: string
    organiserName: string | null;
    featuredImageLargeUrl: string | null
    calendarComment: string | null,
    roster: RosterGroup[] | null;
    affiliation: string | null;
    rider_entry_system: 'ridernet' | 'entry_place' | null;
    rider_entry_url: string | null;
    external_event_id: string | null;
    entries_status: string;
    entries_live_or_post_live: boolean;
    event_website: string | null;
    is_planned: boolean;
    enter_on_ridernet: boolean;
  }

export interface RelatedCalendar {
  name: string;
  slug: string;
  calendar_url: string;
  embed_url: string;
  description?: string;
  is_current: boolean;
  colour: string;
  colour_shade: string;
  colour_full: string;
}

export interface EntryPlaceCalendar {
  slug: string;
  name: string;
  description: string;
  related_calendars?: RelatedCalendar[];
  colour: string;
  colour_shade: string;
  colour_full: string;
  background_image?: string;
  organisation_logo?: string;
  website_link?: string;
  facebook_link?: string;
  instagram_link?: string;
  subscription_count: number;
  membership_link?: string | null;
  show_membership_button: boolean;
}

export interface CalendarResponse {
  message: string;
  calendar: EntryPlaceCalendar;
  data: YearMonthEventGroup[];
}

export interface YearMonthEventGroup {
  label: string;
  yearMonth: number;
  month: number;
  year: number;
  events: CalendarEvent[];
}

export interface DiscoverEventsResponse {
  message: string
  data: CalendarEvent[]
}

/**
 * Returns a local path for the event, avoiding external URLs (e.g. Ridernet).
 * Uses eventPath if it's a relative path, otherwise falls back to /eventSlug.
 */
export function getLocalEventPath(event: CalendarEvent): string {
  if (event.eventPath && !event.eventPath.startsWith('http')) {
    return event.eventPath;
  }
  return `/${event.eventSlug}`;
}

export async function getCalendar(calendarSlug: string): Promise<CalendarResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/calendar/${calendarSlug}`, {
    next: { revalidate: 60 },
    headers: entryPlaceApiHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const data = await response.json();
  return data;
}