<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, MapPin, X } from 'lucide-vue-next'
import { useSpots } from '~/composables/useSpots'
import { useMap } from '~/composables/useMap'
import type { TakjilSpot } from '~/types'

const { spots, selectSpot } = useSpots()
const { setCenter } = useMap()

const query = ref('')
const isOpen = ref(false)

const searchResults = computed(() => {
  if (!query.value.trim()) return []
  const lowercaseQuery = query.value.toLowerCase()
  // Filter spots that are currently active and match query
  return spots.value.filter(s => {
    // Basic active check (optional if `spots` already filters, but good practice)
    if (s.expiresAt < Date.now()) return false
    return s.locationName.toLowerCase().includes(lowercaseQuery) ||
      (s.description && s.description.toLowerCase().includes(lowercaseQuery))
  }).slice(0, 5) // limit to 5 results
})

const handleSelect = (spot: TakjilSpot) => {
  // Center map on spot and open detail card
  setCenter(spot.location.latitude, spot.location.longitude)
  selectSpot(spot)
  isOpen.value = false
  query.value = ''
}
</script>

<template>
  <div class="relative w-full z-30 pointer-events-auto">
    <!-- Backdrop when searching -->
    <div v-if="isOpen" class="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10" @click="isOpen = false"></div>

    <div class="relative bg-background/95 backdrop-blur-sm border shadow-md transition-all duration-300 flex flex-col"
      :class="isOpen ? 'rounded-2xl absolute top-0 -mx-2 w-[calc(100%+16px)]' : 'rounded-full max-h-12'">
      <div class="flex items-center px-4 h-12 shrink-0">
        <Search class="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
        <input v-model="query" @focus="isOpen = true" type="text" placeholder="Cari takjil di sekitar..."
          class="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 outline-none text-foreground placeholder:text-muted-foreground w-full" />
        <button v-if="query || isOpen" @click.stop="query = ''; isOpen = false"
          class="p-1 hover:bg-muted rounded-full ml-1 shrink-0 transition-colors">
          <X class="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <!-- Results Dropdown -->
      <div v-show="isOpen" class="border-t overflow-hidden transition-all duration-300"
        :class="query.trim() ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'">
        <template v-if="searchResults.length > 0">
          <div class="overflow-y-auto max-h-[60vh] py-2">
            <button v-for="spot in searchResults" :key="spot.id" @click="handleSelect(spot)"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-left border-b last:border-b-0 transition-colors">
              <div
                class="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border-2 overflow-hidden bg-muted transition-colors"
                :class="{
                  'border-emerald-500 text-emerald-500': spot.status === 'available',
                  'border-amber-500 text-amber-500': spot.status === 'low_stock',
                  'border-rose-500 text-rose-500': spot.status === 'sold_out',
                }">
                <img v-if="spot.images && spot.images.length > 0"
                  :src="spot.images[0]?.thumbnailUrl || spot.images[0]?.url" alt="Spot"
                  class="w-full h-full object-cover" />
                <MapPin v-else class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm truncate text-foreground leading-tight">{{ spot.locationName }}</h4>
                <p class="text-xs text-muted-foreground truncate mt-0.5">{{ spot.description || 'Ada takjil di sini' }}
                </p>
              </div>
            </button>
          </div>
        </template>
        <div v-else class="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
          <Search class="w-8 h-8 opacity-20 mb-3" />
          <p class="font-medium text-foreground">Spot tidak ditemukan.</p>
          <p class="text-[11px] mt-1 opacity-80">Periksa ejaan atau perbesar jangkauan peta.</p>
        </div>
      </div>
    </div>
  </div>
</template>
