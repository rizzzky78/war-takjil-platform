import { ref } from 'vue'
import type { TakjilSpot } from '../types'
import { useIndexedDB } from './useIndexedDB'
import { useFirestore } from './useFirestore'
import { encodeGeohash } from '../utils/geohash'
import { toast } from 'vue-sonner'

// Shared state
const loading = ref(false)
const spots = ref<TakjilSpot[]>([])
const statusFilter = ref<'all' | 'available' | 'low_stock' | 'sold_out'>('all')
const error = ref<Error | null>(null)
const selectedSpot = ref<TakjilSpot | null>(null)

const filteredSpots = computed(() => {
  const now = Date.now()
  const activeSpots = spots.value.filter(s => s.expiresAt > now)
  if (statusFilter.value === 'all') return activeSpots
  return activeSpots.filter(s => s.status === statusFilter.value)
})

export const useSpots = () => {
  const { getCache, setCache } = useIndexedDB()
  const { getSpotsInRadius } = useFirestore()

  const fetchSpots = async (lat: number, lng: number, radiusInMeters: number = 2000, forceRefresh: boolean = false) => {
    loading.value = true
    error.value = null

    try {
      // 1. Generate a rough geohash key for cache based on coordinates (precision 5 is ~4.9km)
      const cacheKey = `spots_${encodeGeohash(lat, lng, 5)}`

      // 2. Check IndexedDB
      if (!forceRefresh) {
        const cachedSpots = await getCache<TakjilSpot[]>(cacheKey)
        if (cachedSpots && cachedSpots.length > 0) {
          // Filter out expired spots clientside just in case
          spots.value = cachedSpots.filter(spot => spot.expiresAt > Date.now())
          loading.value = false
          return spots.value
        }
      }

      // 3. Cache MISS or force refresh, hit Firestore
      const freshSpots = await getSpotsInRadius(lat, lng, radiusInMeters)

      // 4. Update state and cache
      spots.value = freshSpots
      await setCache(cacheKey, freshSpots)

    } catch (err: any) {
      console.error('Failed to fetch spots:', err)
      error.value = err
      toast.error('Failed to load spots nearby')
      // If offline or error, try to return anything from cache without TTL validation?
      // Since our getCache already deleted expired keys, this relies on what's left.
    } finally {
      loading.value = false
    }

    return spots.value
  }

  // Helper method to clear spots from memory (e.g. on unmount or reset)
  const clearSpots = () => {
    spots.value = []
  }

  return {
    spots,
    filteredSpots,
    statusFilter,
    loading,
    error,
    fetchSpots,
    clearSpots,
    selectedSpot,
    selectSpot: (spot: TakjilSpot | null) => { selectedSpot.value = spot }
  }
}
