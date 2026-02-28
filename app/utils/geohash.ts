import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common'

/** Default search radius in meters */
export const radiusInMeters = 2000

/**
 * Encodes a latitude and longitude into a geohash string
 */
export function encodeGeohash(lat: number, lng: number, precision = 9): string {
  return geohashForLocation([lat, lng], precision)
}

/**
 * Calculates geohash bounds for a given location and radius (in meters)
 * Useful for querying spots within a certain radius.
 */
export function getGeohashBounds(lat: number, lng: number, radius: number) {
  return geohashQueryBounds([lat, lng], radius)
}

/**
 * Calculates the distance between two coordinates in kilometers.
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return distanceBetween([lat1, lon1], [lat2, lon2])
}

/**
 * Format distance to human-readable string (e.g. "500m" or "1.2km")
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`
  }
  return `${distanceInKm.toFixed(1)}km`
}
