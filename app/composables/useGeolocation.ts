import { useGeolocation as useVueUseGeolocation, createSharedComposable } from '@vueuse/core'
import { computed, watchEffect } from 'vue'
import { toast } from 'vue-sonner'

export const useGeolocation = createSharedComposable(() => {
  const { coords, locatedAt, error, resume, pause } = useVueUseGeolocation({
    enableHighAccuracy: true,
  })

  const isLocated = computed(() => coords.value.latitude !== Infinity)

  const requestPermission = () => {
    resume()
  }

  watchEffect(() => {
    if (error.value) {
      toast.error('Location error: ' + error.value.message)
    }
  })

  return {
    coords,
    locatedAt,
    error,
    isLocated,
    requestPermission,
    startWatch: resume,
    stopWatch: pause
  }
})
