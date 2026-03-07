<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { Card, CardFooter } from '~/components/ui/card'
import SpotStatusBadge from './SpotStatusBadge.vue'
import { formatRelativeTime } from '~/utils/time'
import type { TakjilSpot } from '~/types'
import { useRouter } from 'vue-router'
import { Trash2, Loader2, ShieldCheck } from 'lucide-vue-next'
import { useAppAuth } from '~/composables/useAppAuth'
import { useFirestore } from '~/composables/useFirestore'
import { useSpots } from '~/composables/useSpots'
import { toast } from 'vue-sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const props = defineProps<{
  spot: TakjilSpot | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const { user } = useAppAuth()
const { deleteSpot } = useFirestore()
const { fetchSpots } = useSpots()

const isDeleting = ref(false)
const isDialogOpen = ref(false)
const contentElement = ref<HTMLElement | null>(null)

watch(() => props.spot, async (newSpot, oldSpot) => {
  if (newSpot && newSpot.id !== oldSpot?.id) {
    if (!oldSpot) return // let the animate-in handle the first mount

    await nextTick()
    if (contentElement.value) {
      gsap.fromTo(contentElement.value,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', clearProps: 'all' }
      )
    }
  }
})

const timeAgo = computed(() => {
  if (!props.spot) return ''
  return formatRelativeTime(props.spot.lastStatusUpdate || props.spot.createdAt)
})

const thumbnailUrl = computed(() => {
  if (props.spot?.images && props.spot.images.length > 0) {
    const firstImage = props.spot.images[0]
    return firstImage?.thumbnailUrl || firstImage?.url
  }
  return ''
})

const isOwner = computed(() => {
  return props.spot && user.value && props.spot.createdBy === user.value.id
})

const goToDetail = () => {
  if (props.spot) {
    router.push(`/spot/${props.spot.id}`)
  }
}

const handleDelete = async () => {
  if (!props.spot || !isOwner.value) return

  isDeleting.value = true
  try {
    await deleteSpot(props.spot.id)
    toast.success('Spot deleted successfully')

    // Refresh map to remove the deleted spot
    await fetchSpots(props.spot.location.latitude, props.spot.location.longitude, 5000, true)

    // Close the card
    isDialogOpen.value = false
    emit('close')
  } catch (error) {
    console.error('Failed to delete spot:', error)
    toast.error('Failed to delete spot. Please try again.')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div v-if="spot"
    class="absolute bottom-20 md:bottom-4 left-4 right-4 z-[25] animate-in slide-in-from-bottom-5 fade-in duration-300">
    <Card class="w-full relative shadow-xl border-t-4 border-t-green-700/50 cursor-pointer overflow-hidden"
      @click="goToDetail">

      <!-- Actions Context (Top Right) -->
      <div class="absolute right-2 top-2 flex items-center gap-2 z-10">
        <!-- Delete Button for Owner -->
        <AlertDialog v-if="isOwner" v-model:open="isDialogOpen">
          <AlertDialogTrigger as-child>
            <button @click.stop
              class="p-2 rounded-full hover:bg-red-100 text-red-500 dark:hover:bg-red-900/30 transition-colors bg-white/50 backdrop-blur-sm dark:bg-black/50">
              <span class="sr-only">Delete Spot</span>
              <Trash2 class="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent @click.stop class="max-w-[calc(100vw-2rem)] w-full rounded-xl sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your takjil spot reporting from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel :disabled="isDeleting">Cancel</AlertDialogCancel>
              <AlertDialogAction @click.prevent="handleDelete" :disabled="isDeleting"
                class="bg-red-500 text-white hover:bg-red-600">
                <Loader2 v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin" />
                <span>{{ isDeleting ? 'Deleting...' : 'Delete Spot' }}</span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <!-- Close Button -->
        <button @click.stop="emit('close')"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white/50 backdrop-blur-sm dark:bg-black/50">
          <span class="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div ref="contentElement" class="flex px-6 gap-3 items-center mt-2">
        <!-- Thumbnail -->
        <div v-if="thumbnailUrl"
          class="size-28 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border">
          <img :src="thumbnailUrl" alt="Spot preview" class="w-full h-full object-cover" />
        </div>
        <div v-else
          class="size-28 rounded-md flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl border">
          🍽️
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 pr-2">

          <h3 class="font-bold text-lg leading-tight truncate" :class="{ 'mt-0': spot.isSellerManaged }">{{
            spot.locationName }}</h3>
          <p v-if="spot.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-4">
            {{ spot.description }}
          </p>

          <div class="flex flex-col space-y-1 mt-1.5">
            <div class="flex items-center space-x-2">
              <div class="flex items-center gap-2" v-if="spot.isSellerManaged">
                <span
                  class="inline-flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                  <ShieldCheck class="w-3 h-3 text-green-500" /> Penjual
                </span>
              </div>
              <SpotStatusBadge :status="spot.status" />
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">Ditambahkan: {{ timeAgo }}</span>
          </div>
        </div>
      </div>
      <CardFooter>
        <Button @click="goToDetail" class="w-full">Lihat Detail</Button>
      </CardFooter>
    </Card>
  </div>
</template>
