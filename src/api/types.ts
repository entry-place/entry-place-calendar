// Types migrated from entry-place-web project

export interface RosterContact {
  id: number;
  contact_id: number;
  first_name: string;
  last_name: string;
}

export interface RosterPosition {
  position_id: number;
  position_name: string;
  is_required: boolean;
  contacts: RosterContact[];
}

export interface RosterGroup {
  roster_id: number;
  event_roster_id: number;
  event_session_id: number | null;
  event_id: number;
  name: string;
  positions: RosterPosition[];
}

export interface CalendarEvent {
  id: number;
  uuid: string;
  heading: string | null;
  subheading: string | null;
  yearWeek: number;
  monthYear: string;
  isSession: boolean;
  isFutureEvent: boolean;
  imageUrl: string;
  date: string;
  dateTime: number;
  eventPath: string;
  urlKey: string;
  eventSlug: string;
  organiserName: string | null;
  featuredImageLargeUrl: string | null;
  calendarComment: string | null;
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

export interface EventLocation {
  latitude: number;
  longitude: number;
  locationName: string | null;
  address: string | null;
}

/**
 * Lightweight event model for list displays (~30% smaller than CalendarEvent).
 * Omits: roster, affiliation, rider_entry_system, rider_entry_url, external_event_id, event_website, is_planned, enter_on_ridernet
 */
export interface EventListItem {
  id: number;
  uuid: string;
  heading: string | null;
  subheading: string | null;
  imageUrl: string;
  featuredImageLargeUrl: string | null;
  date: string; // e.g., "15 Dec 2025"
  dateTime: number; // Unix timestamp
  yearWeek: number; // e.g., 202552
  monthYear: string; // e.g., "2025-12"
  eventPath: string;
  urlKey: string;
  eventSlug: string;
  organiserName: string | null;
  isSession: boolean;
  isFutureEvent: boolean;
  entries_status: string; // "Live", "Closed", "Planned", etc.
  entries_live_or_post_live: boolean;
  calendarComment: string | null;
  location: EventLocation | null; // null for online/TBA events
  locationType: "physical" | "online" | "tba";
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

export interface YearMonthEventGroup {
  label: string;
  yearMonth: number;
  month: number;
  year: number;
  events: CalendarEvent[];
}

export interface CalendarResponse {
  message: string;
  calendar: EntryPlaceCalendar;
  data: YearMonthEventGroup[];
}

export interface DiscoverEventsResponse {
  message: string;
  data: CalendarEvent[];
}
