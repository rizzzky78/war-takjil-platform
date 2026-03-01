<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useSpots } from '~/composables/useSpots'

const router = useRouter()
const { selectedSpot } = useSpots()

const isActive = ref(false)
const overlayEl = ref<HTMLElement | null>(null)
const textEl = ref<HTMLElement | null>(null)
const decorTopEl = ref<HTMLElement | null>(null)
const decorBottomEl = ref<HTMLElement | null>(null)

const spotName = ref('')
const isForward = ref(true)

// Helper to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let unregisterBeforeResolve: (() => void) | null = null
let unregisterAfterEach: (() => void) | null = null

onMounted(() => {
  unregisterBeforeResolve = router.beforeResolve(async (to, from) => {
    // Determine direction and spot name logic
    if (to.path.startsWith('/spot/') && from.path === '/') {
      isForward.value = true
      // We are navigating TO a spot. We should have selectedSpot populated from click
      spotName.value = selectedSpot.value?.locationName || 'Memuat Detail Spot...'
    } else if (to.path === '/' && from.path.startsWith('/spot/')) {
      isForward.value = false
      // Navigating back FROM a spot. We might still have selectedSpot, or we might need to rely on what was already rendered.
      spotName.value = selectedSpot.value?.locationName || 'Kembali...'
    } else {
      // Ignore other routes or initial loads
      return true
    }

    // Activate the overlay
    isActive.value = true

    // Wait a tick for DOM to render `v-if`
    await nextTick()

    if (!overlayEl.value || !textEl.value) return true

    // --- Enter Animation ---
    const tl = gsap.timeline()

    // Slide/Fade in the overlay
    tl.fromTo(overlayEl.value,
      {
        yPercent: isForward.value ? -100 : 100,
        opacity: 0.8
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.inOut'
      }
    )

    // Stagger in decorations
    tl.fromTo([decorTopEl.value, decorBottomEl.value],
      { opacity: 0, scale: 0.8 },
      { opacity: 0.6, scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.5)' },
      '-=0.2'
    )

    // Animate text deeply
    tl.fromTo(textEl.value,
      {
        opacity: 0,
        scale: isForward.value ? 0.8 : 1.2,
        y: isForward.value ? 30 : -30,
        filter: 'blur(10px)'
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power3.out'
      },
      '-=0.3'
    )

    // Let user see the spot name nicely before continuing
    await wait(800)

    // Once the GSAP animation finishes its prominent "cover" state, we let Vue Router proceed.
    return true
  })

  unregisterAfterEach = router.afterEach(async (to, from) => {
    // Only animate out if we were active
    if (!isActive.value || !overlayEl.value || !textEl.value) return

    // Small delay to let new page render underneath ideally
    await wait(100)

    // --- Leave Animation ---
    const tl = gsap.timeline({
      onComplete: () => {
        isActive.value = false // unmount overlay
      }
    })

    // Text exits
    tl.to(textEl.value, {
      opacity: 0,
      scale: isForward.value ? 1.2 : 0.8,
      filter: 'blur(10px)',
      duration: 0.4,
      ease: 'power2.in'
    })

    // Decors disappear
    tl.to([decorTopEl.value, decorBottomEl.value], {
      opacity: 0,
      scale: 0.5,
      duration: 0.3,
      ease: 'power2.in'
    }, '-=0.2')

    // Overlay slides away
    tl.to(overlayEl.value, {
      yPercent: isForward.value ? 100 : -100,
      opacity: 0.8,
      duration: 0.6,
      ease: 'power3.inOut'
    }, '-=0.1')
  })
})

onUnmounted(() => {
  if (unregisterBeforeResolve) unregisterBeforeResolve()
  if (unregisterAfterEach) unregisterAfterEach()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isActive" ref="overlayEl"
      class="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-[#022c22] text-emerald-50 overflow-hidden">
      <!-- Ramadhan Theme Backgrounds same as AppLoading -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,78,59,1)_0%,rgba(2,44,34,1)_100%)]">
      </div>

      <!-- Subtle Islamic-style Arch / Lantern Shapes from gradients -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 rounded-[100%] blur-[100px]">
      </div>
      <div
        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-600/10 rounded-[100%] blur-[80px]">
      </div>

      <!-- Top Decoration (Stars/Crescent implicit) -->
      <div ref="decorTopEl" class="absolute top-24 flex gap-4 text-emerald-300">
        <svg class="w-10 h-10 opacity-70 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" viewBox="0 0 24 24"
          fill="currentColor">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
        </svg>
      </div>

      <!-- Center Typography: The Spot Name -->
      <div class="relative z-10 flex flex-col items-center flex-1 justify-center p-6 text-center">
        <h1 ref="textEl"
          class="text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-100 pb-2 drop-shadow-md shadow-yellow-500/20"
          style="font-family: 'El Messiri', sans-serif;">
          {{ spotName }}
        </h1>
      </div>

      <!-- Bottom Decoration -->
      <div ref="decorBottomEl"
        class="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent shadow-[0_0_10px_rgba(16,185,129,0.5)]">
      </div>
    </div>
  </Teleport>
</template>
