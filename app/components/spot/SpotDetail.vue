<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { TakjilSpot, AppUser } from '~/types'
import SpotImageGallery from './SpotImageGallery.vue'
import SpotStatusBadge from './SpotStatusBadge.vue'
import { formatRelativeTime } from '~/utils/time'
import { useFirestore } from '~/composables/useFirestore'
import { MapPin, Clock, Calendar, ShieldCheck, User as UserIcon, Map as MapIcon, Navigation, Flag } from 'lucide-vue-next'
import { useAppAuth } from '~/composables/useAppAuth'
import SpotComments from './SpotComments.vue'
import ReportAbuseDialog from './ReportAbuseDialog.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  spot: TakjilSpot
}>()

const router = useRouter()
const { getUserProfile } = useFirestore()
const { isSignedIn } = useAppAuth()
const uploader = ref<AppUser | null>(null)
const isLoadingUploader = ref(true)
const reportDialogOpen = ref(false)

onMounted(async () => {
  if (props.spot.createdBy) {
    uploader.value = await getUserProfile(props.spot.createdBy)
  }
  isLoadingUploader.value = false
})

const timeAgo = computed(() => {
  return formatRelativeTime(props.spot.lastStatusUpdate || props.spot.createdAt)
})

const priceLabel = computed(() => {
  switch (props.spot.priceRange) {
    case 'under_10k': return '< Rp 10K'
    case '10k_20k': return 'Rp 10K - Rp 20K'
    case 'above_20k': return '> Rp 20K'
    default: return 'Harga tidak diketahui'
  }
})

// Format absolute date strings
const formatDateString = (timestamp: number) => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}

const censorEmail = (email: string) => {
  if (!email) return ''
  const [name, domain] = email.split('@')
  if (!name || !domain) return email

  const censoredName = name.length > 2
    ? name.substring(0, 3) + '*'.repeat(name.length - 2)
    : name + '***'

  return `${censoredName}@${domain}`
}

const handleSpotRemoved = () => {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col w-full bg-background min-h-screen pb-20">
    <SpotImageGallery :images="spot.images" />

    <div class="p-4 flex flex-col gap-4 mt-2">
      <!-- Title & Status -->
      <div class="flex justify-between items-start gap-4">
        <div>
          <h1 class="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-50">{{ spot.locationName }}</h1>
          <p v-if="spot.address" class="text-gray-500 text-sm mt-1 flex items-start gap-1">
            <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span class="leading-snug">{{ spot.address }}</span>
          </p>
        </div>
        <SpotStatusBadge :status="spot.status" class="flex-shrink-0 mt-1" />
      </div>

      <!-- Quick Stats -->
      <div
        class="flex items-center text-sm text-gray-500 mt-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 p-3 rounded-lg shadow-sm">
        <div class="flex flex-col flex-1 pb-1">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Update Terakhir</span>
          <span class="text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap">{{ timeAgo }}</span>
        </div>
        <div class="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-3"></div>
        <div class="flex flex-col flex-1 pb-1">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Estimasi Harga</span>
          <span class="text-gray-800 dark:text-gray-200 font-medium">{{ priceLabel }}</span>
        </div>
      </div>

      <!-- Map Shortcuts -->
      <div class="grid grid-cols-2 gap-3 mt-1 mb-2">
        <a :href="`https://www.google.com/maps/search/?api=1&query=${spot.location.latitude},${spot.location.longitude}`"
          target="_blank" rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50 font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm">
          <MapIcon class="w-4 h-4" />
          Google Maps
        </a>
        <a :href="`geo:${spot.location.latitude},${spot.location.longitude}?q=${spot.location.latitude},${spot.location.longitude}`"
          class="flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm">
          <Navigation class="w-4 h-4" />
          Peta Lainnya
        </a>
      </div>

      <!-- Description -->
      <div v-if="spot.description" class="mt-2">
        <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Deskripsi</h3>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">{{ spot.description }}</p>
      </div>

      <!-- Detailed Information Section -->
      <div class="mt-4 pt-4 border-t dark:border-gray-800">
        <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3 block">Informasi Detail</h3>
        <div class="grid grid-cols-1 gap-3">
          <!-- Timings -->
          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-800">
            <Calendar class="w-5 h-5 text-primary mt-0.5" />
            <div class="flex flex-col">
              <span class="text-xs font-medium text-gray-500">Waktu Ditambahkan</span>
              <span class="text-sm text-gray-800 dark:text-gray-200">{{ formatDateString(spot.createdAt) }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-800">
            <Clock class="w-5 h-5 text-orange-500 mt-0.5" />
            <div class="flex flex-col">
              <span class="text-xs font-medium text-gray-500">Kedaluwarsa Pada</span>
              <span class="text-sm text-gray-800 dark:text-gray-200">{{ formatDateString(spot.expiresAt) }}</span>
            </div>
          </div>

          <!-- Coordinates -->
          <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-800">
            <MapPin class="w-5 h-5 text-blue-500 mt-0.5" />
            <div class="flex flex-col">
              <span class="text-xs font-medium text-gray-500">Koordinat (Latitude, Longitude)</span>
              <span class="text-sm text-gray-800 dark:text-gray-200 font-mono tracking-tighter">
                {{ spot.location.latitude.toFixed(6) }}, {{ spot.location.longitude.toFixed(6) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Uploader Information Section -->
      <div class="mt-4 pt-4 border-t dark:border-gray-800">
        <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">Dilaporkan Oleh</h3>

        <div v-if="isLoadingUploader"
          class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-800 animate-pulse">
          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>

        <div v-else-if="uploader !== null"
          class="flex items-center gap-4 p-4 bg-white dark:bg-black rounded-xl border dark:border-gray-800 shadow-sm relative overflow-hidden">
          <!-- Seller Badge Decoration -->
          <div v-if="uploader.isSeller"
            class="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
            <ShieldCheck class="w-3 h-3" /> Pedagang
          </div>

          <div
            class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2"
            :class="uploader.isSeller ? 'border-primary' : 'border-transparent'">
            <img v-if="uploader.photoUrl" :src="uploader.photoUrl" alt="Uploader avatar"
              class="w-full h-full object-cover" />
            <UserIcon v-else class="w-6 h-6 text-gray-400" />
          </div>

          <div class="flex flex-col min-w-0 flex-1">
            <span class="font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
              {{ uploader.name || 'Pengguna Anonim' }}
            </span>
            <span v-if="uploader.id"
              class="text-xs text-gray-500 truncate mt-0.5 font-mono bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded w-fit">
              ID: {{ uploader.id.substring(0, 8) }}...
            </span>
            <span v-if="uploader.email" class="text-xs text-gray-500 truncate mt-1">
              {{ censorEmail(uploader.email) }}
            </span>
          </div>
        </div>

        <div v-else class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800 text-center">
          <span class="text-sm text-gray-500">Pengguna tidak diketahui / anonim</span>
        </div>
      </div>

      <SpotComments :spot="spot" />

      <!-- Report Abuse Section -->
      <div v-if="isSignedIn" class="mt-4 mb-6">
        <button @click="reportDialogOpen = true"
          class="w-full flex items-center justify-center gap-2 py-3 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/50">
          <Flag class="w-4 h-4" />
          Laporkan Spot / Penyalahgunaan
        </button>
      </div>

    </div>

    <ReportAbuseDialog :spot="spot" v-model:open="reportDialogOpen" @removed="handleSpotRemoved" />

    <div class="text-center">
      <p class="text-sm text-gray-500">Thank you for sharing!
        <br />
        <span>
          Made with ❤️ by <a href="https://codebyrzky.site" target="_blank" rel="noopener noreferrer"
            class="text-primary underline">Codebyrzky</a>
        </span>
      </p>
    </div>
  </div>
</template>
