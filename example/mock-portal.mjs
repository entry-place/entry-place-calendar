/**
 * Stands in for the Entry Place portal while the example app is under test.
 *
 * The package's server-side fetches (getCalendar) run in the Next server, so
 * Playwright's browser-level request interception cannot see them. A real
 * HTTP server is the only way to make those deterministic.
 */
import { createServer } from 'node:http'
import { calendarResponse, eventResponse } from './fixtures/portal.mjs'

const PORT = Number(process.env.MOCK_PORTAL_PORT ?? 4010)

const routes = [
  [/^\/api\/v1\/calendar\/([^/?]+)/, () => calendarResponse()],
  [/^\/api\/v1\/omni-event\/(\d+)/, (m) => eventResponse(m[1])],
  [/^\/api\/v1\/event\/(\d+)\/results/, () => ({ results: [], files: [] })],
  [/^\/api\/v1\/ads\//, () => ({ handle: 'test', ads: [], display: { width: null, height: null, show_text: false }, cache_until: new Date(Date.now() + 3e5).toISOString() })],
]

createServer((req, res) => {
  const url = req.url ?? '/'
  // The package's axios client sets withCredentials, and browsers reject
  // `Access-Control-Allow-Origin: *` on credentialed requests. Reflect the
  // origin instead, which is what the real portal does.
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] ?? '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Vary', 'Origin')
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return }

  for (const [pattern, handler] of routes) {
    const match = url.match(pattern)
    if (match) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(handler(match)))
      return
    }
  }
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Not found', url }))
}).listen(PORT, () => {
  console.log(`[mock-portal] listening on http://127.0.0.1:${PORT}`)
})
