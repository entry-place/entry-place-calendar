/**
 * @entry-place/calendar
 *
 * The Entry Place calendar UI: the calendar page, event list (grid and list
 * layouts), event drawer with results, sponsor ads, and the API client the
 * components read from. Every component is a Next.js App Router client
 * component unless noted; `getCalendar` is a server-side fetch. There is no
 * account or login concept: club sites do not have accounts.
 */

// Page-level
export { default as CalendarPage } from './components/CalendarPage';
export { default as EventList } from './components/EventList';
export { default as EventListGrid } from './components/EventListGrid';
export { default as EventListList } from './components/EventListList';
export { default as EventDrawer } from './components/EventDrawer';
export { CalendarJsonLd } from './components/CalendarJsonLd';

// Event detail pieces
export { default as EventCTA } from './components/EventCTA';
export { default as EventDetailHeader } from './components/EventDetailHeader';
export { default as EventLocationBox } from './components/EventLocationBox';
export { default as EventOrganiserBox } from './components/EventOrganiserBox';
export { default as EventSchedule } from './components/EventSchedule';
export { default as DocumentsList } from './components/DocumentsList';
export { default as SessionPicker } from './components/SessionPicker';
export { default as ContactOrganiserModal } from './components/ContactOrganiserModal';

// Results
export { default as ResultsBanner } from './components/results/ResultsBanner';
export { default as ResultsClassTable } from './components/results/ResultsClassTable';
export { default as ResultFiles } from './components/results/ResultFiles';

// Ads and primitives
export { default as SponsorAd } from './components/SponsorAd';
export { Button } from './components/Button';
export { Link } from './components/Link';

// API client and types
export * from './api/FetchCalendar';
export type { EventListItem, EventLocation } from './api/types';
export * from './api/FetchEvent';
export * from './api/FetchResults';
export * from './api/credentials';
export { default as apiClient } from './api/axios';
export * from './types/results';

// Utilities
export * from './utils/colorUtils';
export * from './utils/cookieUtils';
