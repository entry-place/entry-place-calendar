import { test, expect } from '@playwright/test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SENTINEL = 'SENTINEL-SERVER-ONLY-MUST-NOT-REACH-BROWSER'

test('renders the calendar from the portal response', async ({ page }) => {
  await page.goto('/calendar')

  await expect(page.getByTestId('calendar-error')).toHaveCount(0)
  await expect(page.getByText('Riverbend Motorcycle Club').first()).toBeVisible()

  // Future events from the fixture, grouped by month.
  await expect(page.getByText('Winter Series Round 3').first()).toBeVisible()
  await expect(page.getByText('Riverbend Classic').first()).toBeVisible()
  await expect(page.getByText('Twilight Practice').first()).toBeVisible()
})

test('past events are hidden until asked for', async ({ page }) => {
  await page.goto('/calendar')
  // Both past-dated fixture events start out of view.
  await expect(page.getByText('Summer Series Round 1')).not.toBeVisible()
  await expect(page.getByText('Come and Try Day')).not.toBeVisible()
  await expect(page.getByRole('button', { name: /older events/i })).toBeVisible()
})

test('opens the event drawer and loads event detail', async ({ page }) => {
  await page.goto('/calendar')
  // Riverbend Classic is the fixture's ridernet event. Clicking an
  // entry_place event navigates to production instead of opening the drawer.
  await page.getByText('Riverbend Classic').first().click()

  // Comes from /api/v1/omni-event, not the calendar payload.
  // A schedule item, so this proves the omni-event fetch resolved and
  // rendered, not just that the drawer opened.
  await expect(page.getByText('Riders briefing', { exact: true })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('Scrutineering runs from 8am', { exact: false })).toBeVisible()
})

test('renders without console errors or failed requests', async ({ page }) => {
  const errors: string[] = []
  const failed: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('requestfailed', (req) => {
    failed.push(`${req.method()} ${req.url()} ${req.failure()?.errorText ?? ''}`)
  })

  await page.goto('/calendar')
  await page.waitForLoadState('networkidle')

  expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([])
  expect(failed, `failed requests:\n${failed.join('\n')}`).toEqual([])
})

test('the server-only credential never reaches the browser', async ({ page }) => {
  // 1. Not in the rendered HTML.
  const response = await page.goto('/calendar')
  expect(await response!.text()).not.toContain(SENTINEL)

  // 2. Not in any client chunk the build produced.
  const staticDir = join(process.cwd(), '.next', 'static')
  const offenders: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (readFileSync(full, 'utf8').includes(SENTINEL)) offenders.push(full)
    }
  }
  walk(staticDir)
  expect(offenders, `secret found in client bundle:\n${offenders.join('\n')}`).toEqual([])

  // 3. The public identifier is expected to be there, which proves the
  //    search above would actually have found the secret if it leaked.
  let identifierFound = false
  const check = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) check(full)
      else if (readFileSync(full, 'utf8').includes('example-identifier-not-a-real-credential')) identifierFound = true
    }
  }
  check(staticDir)
  expect(identifierFound, 'identifier missing from client bundle: the scan is not looking where it should').toBe(true)
})

test('event links use the portal eventPath, query string and all', async ({ page }) => {
  await page.goto('/calendar')

  // The portal sends the full destination as eventPath. Rebuilding it from
  // the slug drops ?sessionId=, which sends session events to the wrong page.
  const link = page.getByRole('link', { name: /Enter on Entry Place/i }).last()
  await expect(link).toHaveAttribute(
    'href',
    'https://entry.place/twilight-practice/select?sessionId=1479',
  )
})
