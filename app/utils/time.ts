import { formatDistanceToNow, isPast, } from 'date-fns'
import { id } from 'date-fns/locale'
import { TTL_2_HOURS } from './constants'

/**
 * Returns a human-readable relative time string (e.g. "5 mins ago", "just now")
 */
export const formatRelativeTime = (timestampMs: number): string => {
  // `formatDistanceToNow` handles differences nicely. We'll add 'ago' suffix by default unless it returns something like "in 5 minutes".
  return formatDistanceToNow(new Date(timestampMs), { addSuffix: true, locale: id })
}

/**
 * Checks if a given timestamp indicates an expired item
 */
export const isExpired = (expiresAtMs: number): boolean => {
  return isPast(new Date(expiresAtMs))
}

/**
 * Calculate standard expiry time given a creation timestamp (e.g. + 2h)
 */
export const calculateExpiry = (createdAtMs: number = Date.now()): number => {
  return createdAtMs + TTL_2_HOURS
}
