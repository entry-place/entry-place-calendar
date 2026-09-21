/**
 * Synthetic portal responses for the example app.
 *
 * The shapes mirror the real `/api/v1/calendar/{slug}` and
 * `/api/v1/omni-event/{id}` payloads field for field, including the
 * inconsistency where a month group's `yearMonth` is a string and an
 * event's is a number. None of the data is real: the club, the events,
 * the people and the venue are invented, so nothing about a live customer
 * ends up in this repository.
 *
 * Dates are generated relative to today, so the fixture never goes stale
 * and the past/future split always has events on both sides.
 */

const CLUB = 'Riverbend Motorcycle Club'
const SLUG = 'riverbend'
const TZ = 'Australia/Melbourne'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function ordinal(n) {
  if (n > 3 && n < 21) return `${n}th`
  switch (n % 10) {
    case 1: return `${n}st`
    case 2: return `${n}nd`
    case 3: return `${n}rd`
    default: return `${n}th`
  }
}

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((t - yearStart) / 86400000) + 1) / 7)
  return Number(`${t.getUTCFullYear()}${String(week).padStart(2, '0')}`)
}

function pad(n) { return String(n).padStart(2, '0') }
function ical(d) { return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` }
function isoDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }

function dayOffset(days) {
  const d = new Date()
  d.setHours(9, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d
}

/** The events the fixture calendar contains, as offsets in days from today. */
const EVENTS = [
  { offset: -63, slug: 'summer-series-round-1', title: 'Summer Series Round 1', results: true },
  { offset: -28, slug: 'come-and-try-day', title: 'Come and Try Day', results: false },
  { offset: 6, slug: 'winter-series-round-3', title: 'Winter Series Round 3', results: false },
  { offset: 27, slug: 'riverbend-classic', title: 'Riverbend Classic', results: false, entry: 'ridernet' },
  { offset: 55, slug: 'twilight-practice', title: 'Twilight Practice', results: false, sessionId: '1479' },
]

const LOCATION = {
  state: 'VIC',
  suburb: 'Riverbend',
  address: '412 Mill Track Road',
  latitude: -37.6521,
  postcode: '3799',
  longitude: 145.4812,
  venue_name: 'Riverbend Reserve',
  full_address: '412 Mill Track Road, Riverbend VIC 3799',
  locationName: 'Riverbend Reserve',
  venue_directions: null,
}

const ROSTER_PEOPLE = [
  ['Dana', 'Whitlock'],
  ['Sam', 'Ferreira'],
  ['Priya', 'Nandakumar'],
]

function rosterFor(eventId) {
  return [{
    name: 'Event day roster',
    event_id: eventId,
    positions: [
      {
        contacts: [{ id: 9001, last_name: ROSTER_PEOPLE[0][1], contact_id: 5001, first_name: ROSTER_PEOPLE[0][0] }],
        is_required: true,
        position_id: 1,
        position_name: 'Clerk of Course',
      },
      {
        contacts: ROSTER_PEOPLE.slice(1).map(([first, last], i) => ({
          id: 9002 + i, last_name: last, contact_id: 5002 + i, first_name: first,
        })),
        is_required: false,
        position_id: 2,
        position_name: 'Section Marshal',
      },
    ],
    roster_id: 300,
    event_roster_id: 400 + eventId,
    event_session_id: null,
  }]
}

function buildEvent(spec, index) {
  const d = dayOffset(spec.offset)
  const end = dayOffset(spec.offset + 1)
  const id = 1000 + index
  const ts = Math.floor(d.getTime() / 1000)
  return {
    id,
    date: `${DAYS[d.getDay()]} ${ordinal(d.getDate())} ${MONTHS[d.getMonth()].slice(0, 3)}`,
    uuid: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
    roster: index === 2 ? rosterFor(id) : [],
    urlKey: spec.slug,
    heading: null,
    sortKey: String(ts),
    dateTime: ts,
    imageUrl: '',
    location: { ...LOCATION },
    timezone: TZ,
    yearWeek: isoWeek(d),
    eventPath: spec.sessionId
      ? `https://entry.place/${spec.slug}/select?sessionId=${spec.sessionId}`
      : `https://entry.place/${spec.slug}`,
    eventSlug: spec.slug,
    isSession: false,
    monthYear: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    sessionId: spec.sessionId ?? null,
    yearMonth: Number(`${d.getFullYear()}${pad(d.getMonth() + 1)}`),
    is_planned: false,
    subheading: spec.title,
    affiliation: 'MA',
    locationType: 'physical',
    event_website: null,
    ical_date_end: ical(end),
    isFutureEvent: spec.offset >= 0,
    organiserName: CLUB,
    permit_status: 'approved',
    entries_status: spec.offset >= 0 ? 'Live' : 'Closed',
    ical_date_start: ical(d),
    rider_entry_url: `https://entry.place/${spec.slug}`,
    club_organiser_id: 700,
    enter_on_ridernet: spec.entry === 'ridernet',
    external_event_id: null,
    rider_entry_system: spec.entry ?? 'entry_place',
    featuredImageLargeUrl: null,
    entries_live_or_post_live: true,
  }
}

export function calendarResponse() {
  const events = EVENTS.map(buildEvent)
  const groups = new Map()
  for (const e of events) {
    const key = String(e.yearMonth)
    if (!groups.has(key)) {
      const [y, m] = [Number(key.slice(0, 4)), Number(key.slice(4))]
      groups.set(key, { yearMonth: key, label: `${MONTHS[m - 1]} ${y}`, month: m, year: y, events: [] })
    }
    groups.get(key).events.push(e)
  }
  return {
    message: 'Calendar retrieved successfully',
    calendar: {
      slug: SLUG,
      name: CLUB,
      description: 'Club trials, practice days and come-and-try events.',
      colour: 'blue',
      colour_shade: '700',
      colour_full: 'blue-700',
      background_image: '',
      organisation_logo: '',
      website_link: 'https://riverbendmcc.example',
      facebook_link: null,
      instagram_link: null,
      related_calendars: [],
      subscription_count: 42,
      membership_link: `/organiser/${SLUG}/membership`,
      show_membership_button: true,
    },
    data: [...groups.values()].sort((a, b) => Number(a.yearMonth) - Number(b.yearMonth)),
  }
}

/** Only the fields the drawer and its child boxes actually read. */
export function eventResponse(id) {
  const index = Number(id) - 1000
  const spec = EVENTS[index] ?? EVENTS[2]
  const d = dayOffset(spec.offset)
  const pretty = `${DAYS[d.getDay()]}, ${ordinal(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  return {
    event: {
      id: String(id),
      title: spec.title,
      subheading: spec.title,
      body: '<p>Scrutineering runs from 8am. Entries close at the gate.</p>',
      is_session: 0,
      date_formatted_full_pretty: pretty,
      event_timezone: TZ,
      eventTimezone: TZ,
      location_type: 'physical',
      location_name: LOCATION.venue_name,
      location_address: LOCATION.full_address,
      latitude: String(LOCATION.latitude),
      longitude: String(LOCATION.longitude),
      organiser_name: CLUB,
      organiser_description: 'Running club trials at Riverbend Reserve since 1974.',
      organiser_website_link: 'https://riverbendmcc.example',
      organiser_facebook_link: null,
      organiser_instagram_link: null,
      organiser_image_url: null,
      event_organiser_slug: SLUG,
      entries_status: spec.offset >= 0 ? 'Live' : 'Closed',
      entries_public_status: spec.offset >= 0 ? 'Open' : 'Closed',
      entries_contact_details: 'entries@riverbendmcc.example',
      entries_reference_prefix: 'RBC',
      close_date_pretty: pretty,
      close_date_timestamp: Math.floor(dayOffset(spec.offset - 2).getTime() / 1000),
      close_date_timezone: TZ,
      rider_entry_url: `https://entry.place/${spec.slug}`,
      enter_on_ridernet: spec.entry === 'ridernet',
      event_website: null,
      feature_image_url: null,
      featuredImageLargeUrl: null,
      main_purchase_cta: 'Enter now',
      has_results: spec.results,
      is_planned: false,
      future_sessions_count: 0,
      media: [],
      // Shape per EventSchedule / EventScheduleItem in src/api/FetchEvent.ts:
      // a schedule is { title, date, items }, an item is
      // { label, starts_at, ends_at, is_highlighted }.
      schedules: [
        {
          title: 'Event day',
          date: isoDate(d),
          items: [
            { label: 'Gates open', starts_at: `${isoDate(d)}T08:00:00+10:00`, ends_at: null, is_highlighted: false },
            { label: 'Riders briefing', starts_at: `${isoDate(d)}T09:30:00+10:00`, ends_at: null, is_highlighted: true },
            { label: 'Trial starts', starts_at: `${isoDate(d)}T10:00:00+10:00`, ends_at: `${isoDate(d)}T15:00:00+10:00`, is_highlighted: false },
          ],
        },
      ],
    },
    session: null,
  }
}
