<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import gsap from 'gsap'
import { LMap, LTileLayer, LControlZoom } from '@vue-leaflet/vue-leaflet'
import { useMap } from '~/composables/useMap'
import { useGeolocation } from '~/composables/useGeolocation'
import { useSpots } from '~/composables/useSpots'
import SpotMarker from './SpotMarker.vue'
import { Loader2, MapPinOff, RefreshCcw } from 'lucide-vue-next'
import type { TakjilSpot } from '~/types'

const { center, zoom, setCenter, setBounds } = useMap()
const { coords, isLocated, startWatch } = useGeolocation()
const { filteredSpots, loading, fetchSpots } = useSpots()

const mapInstance = ref<any>(null)

const handleMapReady = (map: any) => {
  mapInstance.value = map
  updateBounds()
  // Fetch initial spots for default center
  fetchSpots(center.value[0], center.value[1], 5000)
}

import { useDebounceFn } from '@vueuse/core'

const updateBounds = useDebounceFn(() => {
  if (!mapInstance.value) return
  const currentBounds = mapInstance.value.getBounds()
  setBounds(currentBounds)

  const currentCenter = mapInstance.value.getCenter()
  fetchSpots(currentCenter.lat, currentCenter.lng, 5000)
}, 500)

const handleRefresh = () => {
  if (!mapInstance.value) return
  const currentCenter = mapInstance.value.getCenter()
  fetchSpots(currentCenter.lat, currentCenter.lng, 5000, true)
}

watch(isLocated, (located) => {
  if (located) {
    setCenter(coords.value.latitude, coords.value.longitude)
    fetchSpots(coords.value.latitude, coords.value.longitude, 5000)
  }
})

onMounted(() => {
  startWatch()
})

const onEnter = (el: Element, done: () => void) => {
  gsap.fromTo(
    el,
    { opacity: 0, clipPath: 'inset(0 50% 0 50%)' },
    { opacity: 1, clipPath: 'inset(0 0% 0 0%)', duration: 0.4, ease: 'back.out(1.7)', onComplete: done }
  )
}

const onLeave = (el: Element, done: () => void) => {
  gsap.fromTo(
    el,
    { opacity: 1, clipPath: 'inset(0 0% 0 0%)' },
    { opacity: 0, clipPath: 'inset(0 50% 0 50%)', duration: 0.3, ease: 'power2.in', onComplete: done }
  )
}

const onSpotClick = (spot: TakjilSpot) => {
  const { selectSpot } = useSpots()
  selectSpot(spot)
}
</script>

<template>
  <div class="h-screen w-full relative">
    <LMap ref="map" v-model:zoom="zoom" v-model:center="center" :use-global-leaflet="false" @ready="handleMapReady"
      @moveend="updateBounds" class="h-full w-full z-0" :options="{ zoomControl: false }">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OpenStreetMap" />

      <SpotMarker v-for="spot in filteredSpots" :key="spot.id" :spot="spot" @click="onSpotClick" />
      <LControlZoom position="topleft" class="!mt-20" />
    </LMap>

    <!-- Top Status Overlay (Loading / Empty) -->
    <div
      class="absolute top-20 left-1/2 -translate-x-1/2 z-[20] flex flex-col gap-2 items-center w-[90%] pointer-events-none">
      <Transition @enter="onEnter" @leave="onLeave" :css="false" mode="out-in">
        <div v-if="loading"
          class="bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border text-sm flex items-center gap-2 pointer-events-auto origin-top">
          <Loader2 class="w-4 h-4 animate-spin text-primary" />
          <span class="font-medium">Searching nearby...</span>
        </div>
        <div v-else-if="filteredSpots.length === 0"
          class="bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border text-sm flex items-center gap-2 pointer-events-auto origin-top">
          <MapPinOff class="w-4 h-4 text-muted-foreground" />
          <span class="font-medium text-muted-foreground">No takjil spots found.</span>
          <button @click="handleRefresh"
            class="text-primary font-bold ml-1 flex items-center gap-1 active:scale-95 transition-transform">
            <RefreshCcw class="w-3 h-3" /> Refresh
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-top) {
  margin-top: 5rem;
  margin-left: 0.4rem;
  /* ~80px space from top, enough for the 48px logo + padding */
}
</style>
