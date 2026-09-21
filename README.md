# @entry-place/calendar

The Entry Place calendar UI as a package: the calendar page (title, JSON-LD,
month-grouped event list in grid and list layouts), the event drawer
(details, schedule, documents, results), sponsor ads, and the API client
those components read through.

## Requirements

Next.js 16 or newer, using the **App Router**. The components use
`next/navigation` and will not run under the Pages Router. React 19, and
Tailwind CSS v4 for styling.

## Install

```bash
npm install @entry-place/calendar
```

## Setup

1. **Transpile.** The package ships TypeScript source, so add
   `transpilePackages: ['@entry-place/calendar']` to `next.config.ts`.

2. **Styles.** In the host's global CSS, straight after
   `@import "tailwindcss";`:

   ```css
   @import "@entry-place/calendar/styles.css";
   ```

   That file registers the package's components with the host's Tailwind
   build (`@source`), safelists the runtime calendar colour classes, and
   carries the bottom-sheet CSS the components rely on.

3. **Layout.** The host's root layout needs the Archivo variable font (the
   Google Fonts link with the `wdth` axis) and a `<Toaster>` from
   `react-hot-toast`. Nothing else: the package ships its own icons and
   imports them through the bundler, so there are no files to copy into
   your `public/`.

4. **Environment.** See [Environment](#environment) below.

## Environment

In development Next.js reads these from `.env.local`, which stays out of git.
For a deployed site set them in the host's environment settings (Netlify: Site
configuration → Environment variables. Vercel: Settings → Environment
Variables). `NEXT_PUBLIC_` values are compiled into the browser bundle;
anything without the prefix stays server-side.

```bash
# .env.local
NEXT_PUBLIC_API_HOST=https://api.entry.place
NEXT_PUBLIC_ENTRY_PLACE_API_IDENTIFIER=ep_yourrandomidentifiergoeshere
ENTRY_PLACE_API_SECRET=eps_yoursecretgoeshereneverputthisinagitrepo
NEXT_PUBLIC_BASE_URL=https://gumdalemcc.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYOURGOOGLEMAPSKEYGOESHERE
```

Placeholders, not working values. [`example/.env`](./example/.env) is a
filled-in set pointed at the mock portal.

| Variable | Required | Where the value comes from |
| --- | --- | --- |
| `NEXT_PUBLIC_API_HOST` | yes | Entry Place. The same for every club |
| `NEXT_PUBLIC_ENTRY_PLACE_API_IDENTIFIER` | yes | The portal, Site → Developers |
| `ENTRY_PLACE_API_SECRET` | strongly recommended | The portal, same screen |
| `NEXT_PUBLIC_BASE_URL` (or `NEXT_PUBLIC_SITE_URL`) | yes | You. Your own site's address |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | for the maps | You. Google Cloud console |
| `NEXT_PUBLIC_AD_API_BASE` | no | Overrides the ad host, which follows `NEXT_PUBLIC_API_HOST` |

### `NEXT_PUBLIC_API_HOST`

The Entry Place API, no trailing slash. The same for every club.

```bash
NEXT_PUBLIC_API_HOST=https://api.entry.place
```

### `NEXT_PUBLIC_ENTRY_PLACE_API_IDENTIFIER`

`ep_` followed by 24 lowercase letters and digits.

```bash
NEXT_PUBLIC_ENTRY_PLACE_API_IDENTIFIER=ep_yourrandomidentifiergoeshere
```

Go to https://portal.entry.place/o/last/site/settings/developers, under API
credentials you will find your identifier and secret.

Wherever these docs link to a portal page as
`https://portal.entry.place/o/last/...`, `last` is a placeholder. Open the link
while signed in to the portal and it redirects to that page for whichever
organisation you last had open. Substitute your own club's slug if you would
rather link to it directly.

Public: it goes out in an `X-EP-Identifier` header on every request, including
from the browser.

### `ENTRY_PLACE_API_SECRET`

`eps_` followed by 48 letters and digits. Same screen, the Secret field.

```bash
ENTRY_PLACE_API_SECRET=eps_yoursecretgoeshereneverputthisinagitrepo
```

No `NEXT_PUBLIC_` prefix, so it stays out of the browser bundle; the package
sends it in `X-EP-Secret` from server-side code only. Keep it out of git.

Not strictly needed: every endpoint the package reads accepts the identifier
alone. Set it anyway. A call carrying a valid secret gets 600 requests a
minute keyed to your club, against 60 a minute per IP address without one.

Credentials cannot be regenerated on the portal. If the secret is exposed,
email info@entryplace.com.au for a new pair.

### `NEXT_PUBLIC_BASE_URL` (or `NEXT_PUBLIC_SITE_URL`)

Your own site's address, no trailing slash. Not an Entry Place value.

```bash
# production
NEXT_PUBLIC_BASE_URL=https://gumdalemcc.com

# development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Used for the URLs in the calendar's JSON-LD. Share links do not use it: they
are built from the address the visitor is already on. `NEXT_PUBLIC_BASE_URL` is
read first, `NEXT_PUBLIC_SITE_URL` second. With neither, those URLs come out as
paths with no host.

### `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

39 characters beginning `AIza`. Yours from Google, not Entry Place. It draws
the static map in the event drawer's location and organiser boxes.

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYOURGOOGLEMAPSKEYGOESHERE
```

At [console.cloud.google.com](https://console.cloud.google.com): create a
project and enable billing on it, enable the **Maps Static API** (the only
Google API this package calls), then **APIs & Services → Credentials → Create
credentials → API key**. Restrict the key: Application restrictions to HTTP
referrers with your own domains, API restrictions to Maps Static API.

Without a key Google answers with a 403, so the box shows a broken image.

### `NEXT_PUBLIC_AD_API_BASE`

Ads follow `NEXT_PUBLIC_API_HOST`. Set this only to send ad requests somewhere
else, and only if you show ads at all.

```bash
NEXT_PUBLIC_AD_API_BASE=https://api.entry.place
```

### Checking the values

Every API response carries an `X-EP-Auth` header: `ok`, `missing` or `invalid`.

```bash
curl -si https://api.entry.place/api/v1/calendar/YOUR-CALENDAR-SLUG \
  -H "X-EP-Identifier: ep_yourrandomidentifiergoeshere" \
  -H "X-EP-Secret: eps_yoursecretgoeshereneverputthisinagitrepo" | grep -i "http/\|x-ep-auth"
```

A 404 with `x-ep-auth: ok` means the credentials are right and the calendar
slug is wrong.

## Slugs and credentials

Three values identify a club, and they are not interchangeable.

| Value | Looks like | What it identifies | Used by |
| --- | --- | --- | --- |
| **Calendar slug** | `gumdale-2026` | One calendar belonging to a club | `getCalendar(calendarSlug)` |
| **Organiser slug** | `gumdale` | The club itself | `SponsorAd`'s `org`, `inlineAds.org` |
| **API identifier and secret** | `ep_...`, `eps_...` | The club's API credentials | The env vars above |

Both slugs are lowercase and hyphenated. They are often the same string, but
not always: a club can run more than one calendar, and a calendar slug can
differ from the organiser slug entirely. Do not derive one from the other.

**Where to get them.** All four are on the portal's **Site → Developers**
screen, https://portal.entry.place/o/last/site/settings/developers. That is the
answer for a one-off site. The credentials have their own box; the slugs are
the last part of the endpoint URLs below it (`/api/v1/sponsors/gumdale`,
`/api/v1/calendar/gumdale-2026`).

**Better: ask the portal rather than hardcoding.** The site-config endpoint
returns the current values, and the calendar chosen on that same screen wins
over anything you hardcode:

```
GET {NEXT_PUBLIC_API_HOST}/api/v1/site-config/slug/{organiserSlug}
GET {NEXT_PUBLIC_API_HOST}/api/v1/site-config/domain/{yourDomain}
```

```jsonc
{
  "success": true,
  "data": {
    "organiserSlug": "gumdale",
    "calendarSlug": "gumdale",   // may be null if no calendar is chosen yet
    "name": "Gumdale Motorcycle Club",
    "domain": "gumdalemcc.com",
    "features": { "newsletter": true },
    "banners": [],
    "organiser": { /* ... */ }
  }
}
```

Handle `calendarSlug` being `null`: it is unset until someone picks a
calendar on the portal.

## Usage

A calendar route:

```tsx
import { CalendarPage, getCalendar } from '@entry-place/calendar'

export default async function Page() {
  const calendarResponse = await getCalendar('gumdale').catch(() => null)

  if (!calendarResponse) {
    return <p>The calendar could not be loaded right now.</p>
  }

  return (
    <CalendarPage
      calendarResponse={calendarResponse}
      subscribeSlot={<YourSubscribeControl />}
    />
  )
}
```

`getCalendar` is a server-side fetch with a 60 second revalidate. **Catch
it.** It throws on a failed response, and an uncaught throw in a statically
rendered page fails the whole build, not just that route.

[`example/`](./example) in this repository is a complete working consumer:
a minimal Next.js app with all of the setup above already done. It runs
against a local stand-in for the portal, so it needs no credentials and no
club to look at.

```bash
cd example
npm install                       # also builds and links the package

npm run mock                      # terminal 1: the stand-in portal
npm run dev                       # terminal 2: localhost:4011/calendar
```

To run its Playwright tests instead, which start the portal themselves:

```bash
npx playwright install chromium   # once
npm test
```

### `CalendarPage` props

| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| `calendarResponse` | `CalendarResponse` | yes | The result of `getCalendar` |
| `subscribeSlot` | `ReactNode` | no | Rendered under the calendar title. The one seam the host fills: a newsletter form, or nothing |
| `colorParam` | `string` | no | Overrides the calendar's configured colour |
| `inlineAds` | `{ org: string, handles: string[] }` | no | Opt in to sponsor ads between event rows. Off unless you pass it (see below) |

### Sponsor ads

Optional. Off by default.

The calendar can show a club's sponsors between event rows. The portal
counts views and clicks against the club, so the club can report back to
them.

With no `inlineAds` prop the calendar makes no ad requests and reserves no
ad space. There is no default org.

To turn them on:

1. Create a sponsor group at
   https://portal.entry.place/o/last/sponsor-groups and add the sponsors'
   artwork at https://portal.entry.place/o/last/sponsor-ads. The group's handle
   is what you pass here.
2. Pass `inlineAds` with the club's organiser slug and one or more handles.

```tsx
<CalendarPage
  calendarResponse={calendarResponse}
  inlineAds={{ org: 'gumdale', handles: ['calendar-inline'] }}
/>
```

`org` is the club's organiser slug and is required. It is never defaulted,
because ads are fetched and views and clicks recorded against it. A default
would record one club's sponsors against another club's numbers.

To place a single ad yourself:

```tsx
import { SponsorAd } from '@entry-place/calendar'

<SponsorAd handle="sidebar" org="gumdale" />
```

### Other exports

`EventList`, `EventListGrid`, `EventListList`, `EventDrawer`,
`CalendarJsonLd`, the event detail pieces (`EventCTA`, `EventDetailHeader`,
`EventLocationBox`, `EventOrganiserBox`, `EventSchedule`, `DocumentsList`,
`SessionPicker`, `ContactOrganiserModal`), the results components
(`ResultsBanner`, `ResultsClassTable`, `ResultFiles`), `Button`, `Link`, and
the API client and its types. `CalendarPage` composes most of them, so reach
for these only when you are building a different page.

`apiClient` is the package's configured axios instance. Its default headers
carry `ENTRY_PLACE_API_SECRET` when it runs server-side, and axios sends
default headers on absolute URLs too, so passing it a third-party URL would
send your secret there. Use it for portal calls or not at all.

## Peer dependencies

`next` (>=16), `react` and `react-dom` (>=19), `tailwindcss` (^4),
`@headlessui/react`, `@heroicons/react`, `react-hot-toast`,
`react-modal-sheet`, `axios`, `clsx`. The host supplies all of them.

## Licence

Apache 2.0. See `LICENSE`.

## Contributing

Issues are welcome; pull requests are not accepted. See `CONTRIBUTING.md`
for why, and for what to put in an issue.
