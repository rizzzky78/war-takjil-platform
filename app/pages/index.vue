<script setup lang="ts">
import MapContainer from '~/components/map/MapContainer.vue'
import SpotCard from '~/components/spot/SpotCard.vue'
import ReportSheet from '~/components/report/ReportSheet.vue'
import LocationButton from '~/components/map/LocationButton.vue'
import { Plus } from 'lucide-vue-next'
import { useSpots } from '~/composables/useSpots'
import { useGeolocation } from '~/composables/useGeolocation'
import { useMap } from '~/composables/useMap'
import { ref, watch, nextTick } from 'vue'
import gsap from 'gsap'

const { selectedSpot, selectSpot, statusFilter, fetchSpots } = useSpots()
const { coords, isLocated, requestPermission } = useGeolocation()
const { setCenter } = useMap()
const isReportSheetOpen = ref(false)

const handleLocationClick = () => {
  requestPermission()
  if (isLocated.value) {
    setCenter(coords.value.latitude, coords.value.longitude)
    fetchSpots(coords.value.latitude, coords.value.longitude, 5000)
  }
}

// Refs for GSAP animation
const filterContainer = ref<HTMLElement | null>(null)
const activeBg = ref<HTMLElement | null>(null)

watch(statusFilter, async (newVal) => {
  await nextTick()
  if (!filterContainer.value || !activeBg.value) return

  const buttons = filterContainer.value.querySelectorAll('button')
  const index = ['all', 'available', 'low_stock', 'sold_out'].indexOf(newVal)
  if (index === -1 || !buttons[index]) return

  const targetBtn = buttons[index]
  const containerRect = filterContainer.value.getBoundingClientRect()
  const btnRect = targetBtn.getBoundingClientRect()

  // Calculate reliable relative position
  const leftPos = btnRect.left - containerRect.left
  const width = btnRect.width

  // Colors based on status
  const colors: Record<string, string> = {
    all: '#1f2937', // using a generic dark slate color instead of hsl(var(--primary)) for gsap interpolation
    available: '#22c55e', // text-green-500
    low_stock: '#eab308', // text-yellow-500
    sold_out: '#ef4444'   // text-red-500
  }

  gsap.to(activeBg.value, {
    x: leftPos,
    width: width,
    backgroundColor: colors[newVal],
    duration: 0.5,
    ease: 'elastic.out(1, 0.7)',
  })
}, { immediate: true })
</script>

<template>
  <main class="h-screen w-full relative overflow-hidden">
    <MapContainer />

    <!-- Status Filter Overlay -->
    <div class="absolute top-5 inset-x-4 z-[20] flex justify-center">
      <div class="flex justify-between space-x-4 items-center w-full">
        <div class="flex items-center justify-center size-10 relative z-50 rounded-full">
          <img src="/app_logo_base.png" alt="War Takjil Logo"
            class="w-full h-full object-contain drop-shadow-md rounded-lg" />
        </div>
        <div ref="filterContainer"
          class="bg-background/95 backdrop-blur-sm shadow-md border rounded-full overflow-hidden flex text-xs font-semibold p-1 gap-1 w-full max-w-[360px] relative">

          <!-- Animated Active Background -->
          <div ref="activeBg" class="absolute top-1 bottom-1 rounded-full z-0" style="left: 0; width: 0px;"></div>

          <button @click="statusFilter = 'all'"
            :class="['flex-1 py-2 rounded-full transition-colors z-10', statusFilter === 'all' ? 'text-primary-foreground bg-[#1f2937]' : 'text-muted-foreground hover:bg-muted']">
            <p class="">All</p>
          </button>
          <button @click=" statusFilter = 'available'" :class="['flex-1 py-2 rounded-full transition-colors z-10', statusFilter === 'available'
            ? 'text-white' : 'text-green-600 hover:bg-green-500/10']">
            <p class="">Available</p>
          </button>
          <button @click="statusFilter = 'low_stock'"
            :class="['flex-1 py-2 rounded-full transition-colors z-10', statusFilter === 'low_stock' ? 'text-white' : 'text-yellow-600 hover:bg-yellow-500/10']">
            <p class="">Low Stock</p>
          </button>
          <button @click="statusFilter = 'sold_out'"
            :class="['flex-1 py-2 rounded-full transition-colors z-10', statusFilter === 'sold_out' ? 'text-white' : 'text-red-600 hover:bg-red-500/10']">
            <p class="">Sold Out</p>
          </button>
        </div>
        <SignedIn class="size-10">
          <UserButton class="shrink-0" />
        </SignedIn>
        <SignedOut>
          <div class="size-10 bg-transparent rounded-full">
            <!-- should be blank if user not logged in -->
          </div>
        </SignedOut>
      </div>
    </div>

    <SpotCard :spot="selectedSpot" @close="selectSpot(null)" />

    <!-- Add Spot Button -->
    <div class="absolute bottom-30 lg:bottom-12 left-1/2 -translate-x-1/2 z-[20] flex items-center">
      <button @click="isReportSheetOpen = true"
        class="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-full flex items-center justify-center gap-2 px-6 py-3 font-semibold transition-transform active:scale-95">
        <Plus class="w-5 h-5" />
        <span class="text-sm">Add Spot</span>
      </button>
      <LocationButton :is-located="isLocated" @click="handleLocationClick" />
    </div>

    <!-- Report Sheet Component -->
    <ReportSheet v-model:open="isReportSheetOpen" mode="create" />
  </main>
</template>
