import { EntryPlaceCalendar } from '../api/FetchCalendar';

/**
 * Resolves the calendar color based on query parameter, API data, or fallback
 * Priority: queryParam -> calendar.colour_full -> calendar.colour + colour_shade -> 'red-700'
 */
export function resolveCalendarColor(
  calendar: EntryPlaceCalendar,
  queryParam?: string
): string {
  // Highest priority: query parameter
  if (queryParam && isValidTailwindColor(queryParam)) {
    return queryParam;
  }

  // Second priority: full color from API (now required, but validate format)
  if (isValidTailwindColor(calendar.colour_full)) {
    return calendar.colour_full;
  }

  // Third priority: combine colour and colour_shade from API (now required)
  const combinedColor = `${calendar.colour}-${calendar.colour_shade}`;
  if (isValidTailwindColor(combinedColor)) {
    return combinedColor;
  }

  // Fallback (only if API data is invalid)
  return 'red-700';
}

/**
 * Basic validation for Tailwind color format
 * Checks for pattern like 'color-shade' (e.g., 'purple-700', 'blue-500')
 */
function isValidTailwindColor(color: string): boolean {
  // Basic pattern matching for Tailwind colors
  const tailwindColorPattern = /^[a-z]+(-[0-9]{2,3})?$/;
  return tailwindColorPattern.test(color);
}

/**
 * Generates dynamic Tailwind classes for text colors
 */
export function getTextColorClass(baseColor: string): string {
  return `text-${baseColor}`;
}

/**
 * Generates dynamic Tailwind classes for background colors
 */
export function getBgColorClass(baseColor: string): string {
  return `bg-${baseColor}`;
}

/**
 * Generates dynamic Tailwind classes for border colors
 */
export function getBorderColorClass(baseColor: string): string {
  return `border-${baseColor}`;
}