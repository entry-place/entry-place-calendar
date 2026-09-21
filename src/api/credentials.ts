/**
 * The club's Entry Place API credentials, issued once on the portal's
 * Site → Developers screen.
 *
 * The identifier is public and goes on every request, including from the
 * browser. The secret is server-only: it is read from a non-NEXT_PUBLIC env
 * var, so it never reaches the browser bundle and is only attached by
 * server-side code (RSC fetches and the /api proxies). In the browser this
 * helper therefore yields the identifier header alone.
 */
export const ENTRY_PLACE_API_IDENTIFIER =
  process.env.NEXT_PUBLIC_ENTRY_PLACE_API_IDENTIFIER

export function entryPlaceApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  if (ENTRY_PLACE_API_IDENTIFIER) {
    headers['X-EP-Identifier'] = ENTRY_PLACE_API_IDENTIFIER
  }
  const secret = process.env.ENTRY_PLACE_API_SECRET
  if (secret) {
    headers['X-EP-Secret'] = secret
  }
  return headers
}

/**
 * For calls that cannot set headers (navigator.sendBeacon): the portal also
 * accepts the identifier as an `identifier` query parameter.
 */
export function withIdentifierQuery(url: string): string {
  if (!ENTRY_PLACE_API_IDENTIFIER) {
    return url
  }
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}identifier=${encodeURIComponent(ENTRY_PLACE_API_IDENTIFIER)}`
}
