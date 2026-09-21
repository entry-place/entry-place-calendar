import { CalendarPage, getCalendar } from '@entry-place/calendar'

// Always hit the mock portal; never serve a cached build between test runs.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ExampleCalendarPage() {
  const calendarResponse = await getCalendar('riverbend').catch(() => null)

  if (!calendarResponse) {
    return <div data-testid="calendar-error">Calendar could not be loaded.</div>
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-16">
      <CalendarPage calendarResponse={calendarResponse} />
    </div>
  )
}
