<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'
import { Crosshair, MapPin } from 'lucide-vue-next'
import { useGeolocation } from '~/composables/useGeolocation'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  modelValue: { latitude: number; longitude: number } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [location: { latitude: number; longitude: number }]
}>()

const { coords, isLocated, requestPermission } = useGeolocation()

// Default center to Jakarta or existing modelValue
const center = ref<[number, number]>([-6.2088, 106.8456])
const zoom = ref(15)
const mapInstance = ref<any>(null)

onMounted(() => {
  if (props.modelValue) {
    center.value = [props.modelValue.latitude, props.modelValue.longitude]
  } else if (isLocated.value) {
    center.value = [coords.value.latitude, coords.value.longitude]
    emit('update:modelValue', { latitude: coords.value.latitude, longitude: coords.value.longitude })
  }
})

const handleMapReady = (map: any) => {
  mapInstance.value = map
  updateCenter() // emit initial center on load
}

const updateCenter = () => {
  if (!mapInstance.value) return
  const currentCenter = mapInstance.value.getCenter()
  center.value = [currentCenter.lat, currentCenter.lng]
  emit('update:modelValue', {
    latitude: currentCenter.lat,
    longitude: currentCenter.lng
  })
}

const centerOnMe = () => {
  requestPermission()
  if (isLocated.value) {
    center.value = [coords.value.latitude, coords.value.longitude]
    emit('update:modelValue', {
      latitude: coords.value.latitude,
      longitude: coords.value.longitude
    })
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex justify-between items-center">
      <h4 class="text-sm font-medium">Pin Location</h4>
      <Button variant="outline" size="sm" class="h-8 gap-2 text-primary" @click.prevent="centerOnMe">
        <Crosshair class="w-4 h-4" />
        Use GPS
      </Button>
    </div>

    <div class="h-[300px] rounded-md overflow-hidden border relative bg-muted">
      <LMap ref="map" v-model:zoom="zoom" v-model:center="center" :use-global-leaflet="false" @ready="handleMapReady"
        @moveend="updateCenter" class="h-full w-full z-0">
        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OpenStreetMap"
          attribution="" />
      </LMap>

      <!-- Fixed Center Marker that acts as the pin to drop -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
        <MapPin class="w-8 h-8 text-primary drop-shadow-md pb-4" stroke-width="2.5" />
      </div>
    </div>

    <p class="text-[11px] text-muted-foreground text-center">
      Drag the map to adjust the pin's exact location
    </p>
  </div>
</template>
