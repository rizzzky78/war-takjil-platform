<script setup lang="ts">
import { computed } from 'vue'
import { LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import { Store } from 'lucide-vue-next'
import type { TakjilSpot } from '~/types'

const props = defineProps<{
  spot: TakjilSpot
}>()

const emit = defineEmits<{
  (e: 'click', spot: TakjilSpot): void
}>()

const statusConfig = computed(() => {
  switch (props.spot.status) {
    case 'available': return {
      bg: 'bg-emerald-500',
      stroke: 'stroke-emerald-600',
      pulse: true
    }
    case 'low_stock': return {
      bg: 'bg-amber-500',
      stroke: 'stroke-amber-600',
      pulse: false
    }
    case 'sold_out': return {
      bg: 'bg-rose-500',
      stroke: 'stroke-rose-600',
      pulse: false
    }
    default: return {
      bg: 'bg-slate-500',
      stroke: 'stroke-slate-600',
      pulse: false
    }
  }
})

const position = computed(() => [props.spot.location.latitude, props.spot.location.longitude] as [number, number])
</script>

<template>
  <LMarker :lat-lng="position" @click="emit('click', spot)">
    <LIcon :icon-size="[44, 54]" :icon-anchor="[22, 54]" class-name="custom-div-icon">
      <div
        class="relative flex flex-col items-center justify-start marker-bounce group w-[44px] h-[54px] cursor-pointer">

        <!-- Pulse effect for available spots -->
        <div v-if="statusConfig.pulse"
          class="absolute top-[2px] w-[36px] h-[36px] rounded-full opacity-40 animate-ping z-0"
          :class="statusConfig.bg"></div>

        <!-- SVG Map Pin -->
        <div
          class="relative z-10 w-[44px] h-[54px] transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-95 drop-shadow-md">
          <svg viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute w-full h-full">
            <path d="M22 50C22 50 4 33.5 4 20C4 10.0589 12.0589 2 22 2C31.9411 2 40 10.0589 40 20C40 33.5 22 50 22 50Z"
              class="fill-white" :class="statusConfig.stroke" stroke-width="3" stroke-linejoin="round" />
          </svg>

          <!-- Inner icon container -->
          <div class="absolute top-[2px] left-[4px] w-[36px] h-[36px] flex items-center justify-center">
            <div class="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm"
              :class="statusConfig.bg">
              <Store class="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110"
                stroke-width="2.5" />
            </div>
          </div>
        </div>

        <!-- Drop Shadow directly under -->
        <div
          class="absolute bottom-0 w-6 h-1.5 bg-black/20 rounded-[50%] blur-[2px] transition-all duration-300 group-hover:scale-75 group-hover:opacity-40">
        </div>
      </div>
    </LIcon>
  </LMarker>
</template>

<style>
.custom-div-icon {
  background: transparent;
  border: none;
}

.marker-bounce {
  transform-origin: bottom center;
  animation: marker-bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes marker-bounce-in {
  0% {
    transform: scale(0) translateY(20px);
    opacity: 0;
  }

  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
