<script setup lang="ts">
import { computed } from 'vue'
import { LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import type { TakjilSpot } from '~/types'

const props = defineProps<{
  spot: TakjilSpot
}>()

const emit = defineEmits<{
  (e: 'click', spot: TakjilSpot): void
}>()

const statusColor = computed(() => {
  switch (props.spot.status) {
    case 'available': return 'bg-green-500 border-green-700'
    case 'low_stock': return 'bg-yellow-500 border-yellow-700'
    case 'sold_out': return 'bg-red-500 border-red-700'
    default: return 'bg-gray-500 border-gray-700'
  }
})

const position = computed(() => [props.spot.location.latitude, props.spot.location.longitude] as [number, number])
</script>

<template>
  <LMarker :lat-lng="position" @click="emit('click', spot)">
    <LIcon :icon-size="[32, 32]" :icon-anchor="[16, 32]" class-name="custom-div-icon">
      <div 
        class="w-8 h-8 rounded-full border-2 shadow-md flex items-center justify-center text-white text-[12px] font-bold marker-bounce"
        :class="statusColor"
      >
        🍽️
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
  animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
