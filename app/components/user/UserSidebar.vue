<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppAuth } from '~/composables/useAppAuth'
import { useFirestore } from '~/composables/useFirestore'
import { useSpots } from '~/composables/useSpots'
import { UserButton, SignOutButton } from '@clerk/vue'
import type { TakjilSpot } from '~/types'
import { toast } from 'vue-sonner'
import { Loader2, Share2, MapPin, Edit, Trash2, LogOut } from 'lucide-vue-next'
import SpotStatusBadge from '~/components/spot/SpotStatusBadge.vue'
import { formatRelativeTime } from '~/utils/time'
import ReportSheet from '~/components/report/ReportSheet.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'view-spot': [spot: TakjilSpot]
}>()

const { user, isSignedIn, signIn } = useAppAuth()
const { getUserSpots, deleteSpot } = useFirestore()
const { fetchSpots } = useSpots()

const userSpots = ref<TakjilSpot[]>([])
const isLoadingSpots = ref(false)

const displayedSpots = computed(() => {
  return userSpots.value.slice(0, 15)
})

const isSpotExpired = (spot: TakjilSpot) => {
  return spot.expiresAt < Date.now()
}

const isUpdateSheetOpen = ref(false)
const selectedSpotToUpdate = ref<TakjilSpot | undefined>(undefined)

const isDeleteDialogOpen = ref(false)
const spotToDelete = ref<TakjilSpot | null>(null)
const isDeleting = ref(false)

// Optional: format app version (you can also pass this as a prop from layout/app.vue if preferred)
const appVersion = '1.0.0' // Make sure __APP_VERSION__ is defined in vite config, or just use string
// For now, replacing with literal:
const version = '1.0.0'

const sidebarInnerRef = ref<HTMLElement | null>(null)

watch(() => props.open, async (newVal) => {
  if (newVal) {
    if (isSignedIn.value && user.value) {
      isLoadingSpots.value = true
      try {
        userSpots.value = await getUserSpots(user.value.id)
      } catch (error) {
        console.error('Failed to fetch user spots:', error)
        toast.error('Gagal memuat daftar spot Anda.')
      } finally {
        isLoadingSpots.value = false
      }
    }

    await nextTick()
    if (sidebarInnerRef.value) {
      const elements = Array.from(sidebarInnerRef.value.children)
      gsap.fromTo(elements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }
      )
    }
  } else {
    // When closing, animate slightly to smoothly exit
    if (sidebarInnerRef.value) {
      const elements = Array.from(sidebarInnerRef.value.children).reverse()
      gsap.to(elements,
        { y: 10, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.in' }
      )
    }
  }
})

const getThumbnailUrl = (spot: TakjilSpot) => {
  if (spot.images && spot.images.length > 0) {
    return spot.images[0]?.thumbnailUrl || spot.images[0]?.url
  }
  return ''
}

const handleViewSpot = (spot: TakjilSpot) => {
  emit('view-spot', spot)
  emit('update:open', false)
}

const handleShareSpot = async (spot: TakjilSpot) => {
  const url = `${window.location.origin}/spot/${spot.id}`
  if (navigator.share) {
    try {
      await navigator.share({
        title: `War Takjil - ${spot.locationName}`,
        text: `Cek ketersediaan takjil di ${spot.locationName}!`,
        url: url
      })
    } catch (err) {
      // Ignored share abort
    }
  } else {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link disalin ke clipboard!')
    } catch (err) {
      toast.error('Gagal menyalin link.')
    }
  }
}

const handleUpdateSpot = (spot: TakjilSpot) => {
  selectedSpotToUpdate.value = spot
  isUpdateSheetOpen.value = true
}

const handleUpdateSuccess = async () => {
  isUpdateSheetOpen.value = false
  if (isSignedIn.value && user.value) {
    try {
      userSpots.value = await getUserSpots(user.value.id)
    } catch (error) {
      console.error('Failed to fetch user spots:', error)
    }
  }
}

const confirmDeleteSpot = (spot: TakjilSpot) => {
  spotToDelete.value = spot
  isDeleteDialogOpen.value = true
}

const executeDeleteSpot = async () => {
  if (!spotToDelete.value) return
  isDeleting.value = true
  try {
    await deleteSpot(spotToDelete.value.id)
    userSpots.value = userSpots.value.filter(s => s.id !== spotToDelete.value!.id)
    toast.success('Spot berhasil dihapus')

    // Refresh map (optional, we can just trigger fetchSpots if we are near it)
    await fetchSpots(spotToDelete.value.location.latitude, spotToDelete.value.location.longitude, 5000, true)
  } catch (error) {
    toast.error('Gagal menghapus spot')
    console.error(error)
  } finally {
    isDeleting.value = false
    isDeleteDialogOpen.value = false
    spotToDelete.value = null
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="flex flex-col h-full w-[85vw] sm:w-[400px] border-l outline-none" side="right"
      :hide-close="false" @interact-outside="(e) => {
        const target = e.target as HTMLElement
        // Prevent closing the sidebar if clicking inside a Clerk modal/popover
        if (target.closest('.cl-rootBox') || target.closest('.cl-userButtonPopoverContainer')) {
          e.preventDefault()
        }
      }">
      <div ref="sidebarInnerRef" class="flex flex-col h-full w-full">
        <!-- Signed In State -->
        <template v-if="isSignedIn && user">
          <!-- Logout Button -->
          <div class="absolute left-4 top-4 z-50">
            <SignOutButton>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors cursor-pointer">
                <LogOut class="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </SignOutButton>
          </div>

          <SheetHeader class="text-left mt-14 rounded-xl mx-4 mb-4 py-3.5 flex-shrink-0 bg-[#022c22] backdrop-blur-xl">
            <div class="flex items-start space-x-2">
              <div class="flex items-center justify-center size-10 shrink-0 relative z-50 rounded-full">
                <img src="/app_logo_base.png" alt="War Takjil Logo"
                  class="w-full h-full object-contain drop-shadow-md rounded-lg" />
              </div>
              <div class="-space-y-3">
                <SheetTitle
                  class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r drop-shadow-sm from-yellow-100 via-yellow-400 to-yellow-100">
                  War Takjil
                </SheetTitle>
                <SheetDescription class="mt-2 text-xs text-white/80 leading-relaxed">
                  Pantau keberadaan takjil di sekitarmu secara real-time. Bagikan info takjil yang kamu temui untuk
                  membantu
                  sesama pejuang takjil lainnya.
                </SheetDescription>
              </div>
            </div>

          </SheetHeader>

          <div class="mx-4 mb-4 pb-4 border-b flex-shrink-0">
            <div class="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <div class="flex flex-col overflow-hidden">
                <div class="truncate text-base font-semibold">{{ user.fullName || 'User' }}</div>
                <div class="truncate text-xs text-muted-foreground">{{ user.primaryEmailAddress?.emailAddress }}</div>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 mx-4 pb-4">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-sm">Spot yang kamu tambahkan</h3>
              <span class="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{{ displayedSpots.length
              }}</span>
            </div>

            <div v-if="isLoadingSpots" class="flex justify-center py-8">
              <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
            <div v-else-if="displayedSpots.length === 0"
              class="text-center py-8 text-sm text-muted-foreground bg-muted/50 rounded-lg">
              Kamu belum menambahkan spot takjil apapun.
            </div>
            <div v-else class="space-y-3">
              <div v-for="spot in displayedSpots" :key="spot.id"
                class="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                :class="{ 'opacity-60': isSpotExpired(spot) }">
                <div class="flex gap-3">
                  <!-- Thumbnail -->
                  <div
                    class="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                    <img v-if="getThumbnailUrl(spot)" :src="getThumbnailUrl(spot)" class="w-full h-full object-cover" />
                    <span v-else class="text-xl">🍽️</span>
                  </div>
                  <!-- Info -->
                  <div class="min-w-0 flex-1">
                    <h4 class="font-medium text-sm truncate">{{ spot.locationName }}</h4>
                    <div class="flex items-center gap-1.5 mt-1">
                      <SpotStatusBadge :status="spot.status" />
                      <span class="text-[10px] text-muted-foreground">{{ formatRelativeTime(spot.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                <!-- Actions -->
                <div class="flex items-center justify-end gap-1 mt-3 pt-2 border-t">
                  <button @click="handleViewSpot(spot)" :disabled="isSpotExpired(spot)"
                    class="p-1.5 hover:bg-accent hover:text-accent-foreground rounded-md text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Lihat di Peta">
                    <MapPin class="w-4 h-4" />
                  </button>
                  <button @click="handleShareSpot(spot)" :disabled="isSpotExpired(spot)"
                    class="p-1.5 hover:bg-accent hover:text-accent-foreground rounded-md text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Bagikan">
                    <Share2 class="w-4 h-4" />
                  </button>
                  <button @click="handleUpdateSpot(spot)" :disabled="isSpotExpired(spot)"
                    class="p-1.5 hover:bg-accent hover:text-accent-foreground rounded-md text-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Update">
                    <Edit class="w-4 h-4" />
                  </button>
                  <button @click="confirmDeleteSpot(spot)"
                    class="p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-colors" title="Hapus">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Signed Out State -->
        <template v-else>
          <SheetHeader class="text-left mt-14 rounded-xl mx-6 mb-8 py-8 flex-shrink-0 bg-[#022c22] backdrop-blur-xl">
            <div class="flex items-center flex-col justify-center space-y-3">
              <div class="flex items-center justify-center size-10 relative z-50 rounded-full">
                <img src="/app_logo_base.png" alt="War Takjil Logo"
                  class="w-full h-full object-contain drop-shadow-md rounded-lg" />
              </div>
              <SheetTitle
                class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r drop-shadow-sm from-yellow-100 via-yellow-400 to-yellow-100">
                War Takjil
              </SheetTitle>
            </div>
            <SheetDescription class="mt-2 text-sm text-center text-white/80 leading-relaxed">
              Pantau keberadaan takjil di sekitarmu secara real-time. Bagikan info takjil yang kamu temui untuk membantu
              sesama pejuang takjil lainnya.
            </SheetDescription>
          </SheetHeader>

          <div class="flex-1 flex flex-col justify-center gap-6 mx-6">
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                  <MapPin class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-medium text-sm">Temukan Spot Takjil</h4>
                  <p class="text-xs text-muted-foreground mt-0.5">Lihat lokasi takjil di sekitarmu dengan mudah</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                  <Edit class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-medium text-sm">Update Status Real-time</h4>
                  <p class="text-xs text-muted-foreground mt-0.5">Beri tahu yang lain jika takjil sudah mulai habis atau
                    kosong</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                  <Share2 class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-medium text-sm">Bagikan ke Teman</h4>
                  <p class="text-xs text-muted-foreground mt-0.5">Ajak temanmu untuk berburu takjil bersama</p>
                </div>
              </div>
            </div>

            <div class="bg-muted p-4 rounded-xl mt-4">
              <h4 class="font-medium text-sm text-center mb-3">Masuk untuk ikut berkontribusi</h4>
              <div class="flex justify-center">
                <button @click="signIn()"
                  class="w-full py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors">
                  Login
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Footer -->
        <SheetFooter class="mt-auto pt-4 border-t flex-shrink-0">
          <div class="w-full flex flex-col gap-2">
            <div class="w-full flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-semibold text-foreground/80">War Takjil</span>
              <span>v1.0.0</span>
            </div>
            <div class="w-full flex items-center justify-between text-[10px] text-muted-foreground/70">
              <span>Created with ❤️ by Rizky</span>
              <NuxtLink to="/privacy" class="hover:text-primary transition-colors hover:underline">
                Kebijakan Privasi
              </NuxtLink>
            </div>
          </div>
        </SheetFooter>
      </div>
    </SheetContent>
  </Sheet>

  <!-- External Modals -->
  <ReportSheet :open="isUpdateSheetOpen" @update:open="isUpdateSheetOpen = $event" mode="update"
    :existing-spot="selectedSpotToUpdate" @success="handleUpdateSuccess" />

  <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
    <AlertDialogContent class="w-[90vw] max-w-md rounded-xl">
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus Spot Takjil</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menghapus spot takjil ini? Tindakan ini tidak dapat dibatalkan.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeleting">Batal</AlertDialogCancel>
        <AlertDialogAction @click.prevent="executeDeleteSpot" :disabled="isDeleting"
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          <Loader2 v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin" />
          {{ isDeleting ? 'Menghapus...' : 'Hapus' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
