import { ref } from 'vue'

// Default center (e.g. Jakarta)
const center = ref<[number, number]>([-6.200000, 106.816666])
const zoom = ref(15)
const bounds = ref<any>(null)

export const useMap = () => {

  const setCenter = (lat: number, lng: number) => {
    center.value = [lat, lng]
  }

  const setZoom = (newZoom: number) => {
    zoom.value = newZoom
  }

  const setBounds = (newBounds: any) => {
    bounds.value = newBounds
  }

  return {
    center,
    zoom,
    bounds,
    setCenter,
    setZoom,
    setBounds
  }
}
