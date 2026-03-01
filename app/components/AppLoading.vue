<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
// useNuxtApp is auto imported in Nuxt 3

const isOut = ref(false)
const isLoading = ref(true)
const loadingOverlay = ref<HTMLElement | null>(null)
const logoImg = ref<HTMLElement | null>(null)
const loadingText = ref<HTMLElement | null>(null)
const decorTop = ref<HTMLElement | null>(null)
const starContainer = ref<HTMLElement | null>(null)

// Progress line refs
const progressText = ref(0)
const progressBar = ref<HTMLElement | null>(null)
const percentageElement = ref<HTMLElement | null>(null)

// Generate stars
const stars = Array.from({ length: 40 }).map(() => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1, // 1px to 4px
  opacity: Math.random() * 0.5 + 0.3,
  duration: Math.random() * 3 + 2, // 2s to 5s twinkle
  delay: Math.random() * 2,
}))

// Minimum time to show the loading screen
const MIN_LOADING_TIME = 2500
const startTime = Date.now()

const hideLoading = () => {
  if (isOut.value || !loadingOverlay.value) return
  const elapsedTime = Date.now() - startTime
  const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime)

  setTimeout(() => {
    if (isOut.value) return
    isOut.value = true

    // Scale out logo slightly
    gsap.to(logoImg.value, {
      scale: 1.2,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in'
    })

    // Fade out text and progress bar
    gsap.to([loadingText.value, decorTop.value, progressBar.value, percentageElement.value, starContainer.value], {
      opacity: 0,
      y: 20,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.in'
    })

    // Fade out whole overlay
    gsap.to(loadingOverlay.value, {
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        isLoading.value = false
      }
    })
  }, remainingTime)
}

onMounted(() => {
  // Add dark overlay initially for the page layout so things don't flash
  document.body.style.overflow = 'hidden'

  // Star twinkle animation
  if (starContainer.value) {
    const starEls = starContainer.value.querySelectorAll('.star')
    starEls.forEach((star, index) => {
      gsap.to(star, {
        opacity: Math.random() * 0.3 + 0.1,
        scale: Math.random() * 0.5 + 0.5,
        yoyo: true,
        repeat: -1,
        duration: stars[index]?.duration ?? 2,
        delay: stars[index]?.delay ?? 0,
        ease: 'sine.inOut'
      })
    })
  }

  // Progress animation (0 to 100)
  gsap.to(progressText, {
    value: 100,
    duration: MIN_LOADING_TIME / 1000,
    ease: 'power1.inOut',
    onUpdate: () => {
      progressText.value = Math.round(progressText.value)
    }
  })

  // Progress Bar scaleX
  if (progressBar.value) {
    gsap.fromTo(progressBar.value,
      { scaleX: 0 },
      { scaleX: 1, duration: MIN_LOADING_TIME / 1000, ease: 'power1.inOut', transformOrigin: 'left center' }
    )
  }


  if (logoImg.value) {
    gsap.fromTo(logoImg.value,
      { scale: 0.5, opacity: 0, rotation: -10 },
      { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' }
    )

    // Continuous float & glow
    gsap.to(logoImg.value, {
      y: -10,
      boxShadow: '0 0 50px rgba(250, 204, 21, 0.3)',
      yoyo: true,
      repeat: -1,
      duration: 2,
      ease: 'sine.inOut'
    })
  }

  if (loadingText.value) {
    gsap.fromTo(loadingText.value,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' }
    )
  }

  if (decorTop.value) {
    gsap.fromTo(decorTop.value,
      { opacity: 0, y: -30 },
      { opacity: 0.6, y: 0, duration: 1, delay: 0.2, ease: 'power2.out' }
    )
  }

  // Handle Nuxt hydration / ready
  const nuxtApp = useNuxtApp()

  if (nuxtApp.isHydrating) {
    nuxtApp.hook('app:suspense:resolve', () => {
      document.body.style.overflow = ''
      hideLoading()
    })
  } else {
    document.body.style.overflow = ''
    hideLoading()
  }

  // Fallback timeout in case hook never fires
  setTimeout(() => {
    document.body.style.overflow = ''
    hideLoading()
  }, Math.max(MIN_LOADING_TIME + 2000, 5000))
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isLoading" ref="loadingOverlay"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#022c22] text-emerald-50 overflow-hidden">
      <!-- Animated Background Gradients -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,78,59,1)_0%,rgba(2,44,34,1)_100%)]">
      </div>

      <!-- Random Animated Stars -->
      <div ref="starContainer" class="absolute inset-0 w-full h-full pointer-events-none">
        <div v-for="(star, index) in stars" :key="index" class="star absolute bg-yellow-200 rounded-full" :style="{
          top: star.top,
          left: star.left,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
          boxShadow: `0 0 ${star.size * 2}px rgba(250,204,21,0.8)`
        }"></div>
      </div>

      <!-- Subtle Islamic-style Arch / Lantern Shapes from gradients -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 rounded-[100%] blur-[100px]">
      </div>
      <div
        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-600/10 rounded-[100%] blur-[80px]">
      </div>

      <!-- Top Decoration (Stars/Crescent implicit) -->
      <div ref="decorTop" class="absolute top-12 md:top-24 flex gap-4 text-emerald-300">
        <svg class="w-8 h-8 opacity-70 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" viewBox="0 0 24 24"
          fill="currentColor">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
        </svg>
      </div>

      <!-- Center Content -->
      <div class="relative z-10 flex flex-col items-center flex-1 justify-center mt-12 mb-20">
        <!-- Main Logo Wrapper -->
        <div ref="logoImg"
          class="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center p-6 bg-emerald-950/40 backdrop-blur-xl rounded-full border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] mb-8">
          <img src="/app_logo_base.png" alt="War Takjil"
            class="w-full h-full object-contain filter rounded-full drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
        </div>

        <!-- Typography -->
        <div ref="loadingText" class="flex flex-col items-center">
          <h1
            class="text-3xl sm:text-4xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-100 uppercase pb-1 drop-shadow-sm"
            style="font-family: 'El Messiri', sans-serif;">
            War Takjil
          </h1>
          <div class="flex items-center gap-3 mt-4">
            <div class="w-12 h-[1px] bg-gradient-to-r from-transparent to-emerald-400"></div>
            <p class="text-emerald-300/90 text-sm sm:text-base font-medium tracking-[0.2em] uppercase">
              Memuat Peta
            </p>
            <div class="w-12 h-[1px] bg-gradient-to-l from-transparent to-emerald-400"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Progress Bar & Percentage -->
      <div class="absolute bottom-12 w-full max-w-[280px] sm:max-w-xs flex flex-col items-center justify-center gap-3">
        <!-- Percentage Text -->
        <div ref="percentageElement"
          class="text-yellow-400/90 font-mono text-sm tracking-wider font-semibold drop-shadow-md">
          {{ progressText }}%
        </div>

        <!-- Progress Track -->
        <div
          class="w-full h-1.5 bg-emerald-900/50 rounded-full overflow-hidden border border-emerald-500/10 backdrop-blur-sm relative shadow-inner">
          <!-- Progress Indicator -->
          <div ref="progressBar"
            class="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-yellow-400 rounded-full"
            style="transform: scaleX(0); transform-origin: left center;">
            <!-- Highlight/Glow effect on the tip -->
            <div class="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-[2px] translate-x-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
