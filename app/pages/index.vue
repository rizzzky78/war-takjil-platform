<script setup lang="ts">
import MapContainer from '~/components/map/MapContainer.vue'
import SpotCard from '~/components/spot/SpotCard.vue'
import ReportSheet from '~/components/report/ReportSheet.vue'
import LocationButton from '~/components/map/LocationButton.vue'
import { Plus } from 'lucide-vue-next'
import { useSpots } from '~/composables/useSpots'
import { useGeolocation } from '~/composables/useGeolocation'
import { useMap } from '~/composables/useMap'
import { ref } from 'vue'

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
</script>

<template>
  <main class="h-screen w-full relative overflow-hidden">
    <MapContainer />

    <!-- Status Filter Overlay -->
    <div class="absolute top-4 inset-x-4 z-[20] flex justify-center">
      <div class="flex justify-between space-x-4 items-center w-full">
        <div class="flex items-center justify-center size-10 relative z-50 rounded-full">
          <img src="/app_logo_base.png" alt="War Takjil Logo"
            class="w-full h-full object-contain drop-shadow-md rounded-lg" />
        </div>
        <div
          class="bg-background/95 backdrop-blur-sm shadow-md border rounded-full overflow-hidden flex text-xs font-semibold p-1 gap-1 w-full max-w-[360px]">
          <button @click="statusFilter = 'all'"
            :class="['flex-1 py-2 rounded-full transition-colors', statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted']">
            <p class="mt-1">All</p>
          </button>
          <button @click="statusFilter = 'available'"
            :class="['flex-1 py-2 rounded-full transition-colors', statusFilter === 'available' ? 'bg-green-500 text-white' : 'text-green-600 hover:bg-green-500/10']">
            <p class="mt-1">Tersedia</p>
          </button>
          <button @click="statusFilter = 'low_stock'"
            :class="['flex-1 py-2 rounded-full transition-colors', statusFilter === 'low_stock' ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-500/10']">
            <p class="mt-1">Hampir Habis</p>
          </button>
          <button @click="statusFilter = 'sold_out'"
            :class="['flex-1 py-2 rounded-full transition-colors', statusFilter === 'sold_out' ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-500/10']">
            <p class="mt-1">Habis</p>
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
