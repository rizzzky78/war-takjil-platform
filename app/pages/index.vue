<script setup lang="ts">
import MapContainer from '~/components/map/MapContainer.vue'
import SpotCard from '~/components/spot/SpotCard.vue'
import ReportSheet from '~/components/report/ReportSheet.vue'
import LocationButton from '~/components/map/LocationButton.vue'
import UserSidebar from '~/components/user/UserSidebar.vue'
import SpotSearch from '~/components/spot/SpotSearch.vue'
import { Plus, User } from 'lucide-vue-next'
import { useSpots } from '~/composables/useSpots'
import { useGeolocation } from '~/composables/useGeolocation'
import { useMap } from '~/composables/useMap'
import { useAppAuth } from '~/composables/useAppAuth'
import type { TakjilSpot } from '~/types'
import { ref, watch, nextTick } from 'vue'
import gsap from 'gsap'

const { selectedSpot, selectSpot, statusFilter, fetchSpots } = useSpots()
const { coords, isLocated, requestPermission } = useGeolocation()
const { setCenter } = useMap()
const { user, isSignedIn } = useAppAuth()
const isReportSheetOpen = ref(false)
const isUserSidebarOpen = ref(false)

const handleViewSpotFromSidebar = (spot: TakjilSpot) => {
  setCenter(spot.location.latitude, spot.location.longitude)
  selectSpot(spot)
}

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

    <!-- Top Controls: Logo, Search, Profile -->
    <div class="absolute top-4 inset-x-4 z-[30] flex justify-between gap-3 items-start pointer-events-none">
      <!-- Logo -->
      <div
        class="size-12 shrink-0 bg-background/95 backdrop-blur-sm rounded-2xl shadow-md p-1 pointer-events-auto relative z-50">
        <img src="/app_logo_base.png" alt="War Takjil Logo" class="w-full h-full object-contain rounded-xl" />
      </div>

      <!-- Search Bar -->
      <div class="flex-1 max-w-sm pointer-events-auto">
        <SpotSearch />
      </div>

      <!-- Profile Button -->
      <button @click="isUserSidebarOpen = true"
        class="size-12 shrink-0 bg-background/95 backdrop-blur-sm border shadow-md rounded-2xl flex items-center justify-center hover:bg-muted transition-colors overflow-hidden pointer-events-auto">
        <img v-if="isSignedIn && user?.imageUrl" :src="user.imageUrl" alt="Profile"
          class="w-full h-full object-cover" />
        <User v-else class="size-5 text-muted-foreground" />
      </button>
    </div>

    <!-- Status Filter Overlay -->
    <div class="absolute top-[76px] inset-x-4 z-[20] flex justify-center pointer-events-none">
      <div ref="filterContainer"
        class="bg-background/95 backdrop-blur-sm shadow-md border rounded-full overflow-hidden flex text-xs font-semibold p-1 gap-1 w-full max-w-[360px] relative pointer-events-auto">

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

    <!-- User Sidebar Component -->
    <UserSidebar v-model:open="isUserSidebarOpen" @view-spot="handleViewSpotFromSidebar" />
  </main>
</template>
