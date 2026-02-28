<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirestore } from '~/composables/useFirestore'
import type { TakjilSpot } from '~/types'
import SpotDetail from '~/components/spot/SpotDetail.vue'
import SpotDetailSkeleton from '~/components/spot/SpotDetailSkeleton.vue'

const route = useRoute()
const router = useRouter()
const { getSpot } = useFirestore()

const spotId = route.params.id as string
const spot = ref<TakjilSpot | null>(null)
const loading = ref(true)

onMounted(async () => {
  if (!spotId) {
    router.replace('/')
    return
  }

  try {
    const fetchedSpot = await getSpot(spotId)
    if (fetchedSpot) {
      spot.value = fetchedSpot
    } else {
      alert('Spot tidak ditemukan atau sudah kedaluwarsa')
      router.replace('/')
    }
  } catch (error) {
    console.error('Failed to load spot:', error)
    alert('Terjadi kesalahan saat memuat data')
    router.replace('/')
  } finally {
    loading.value = false
  }
})

import { useSeoMeta } from '#imports'
import { watchEffect } from 'vue'

watchEffect(() => {
  if (spot.value) {
    useSeoMeta({
      title: spot.value.locationName,
      description: spot.value.description || `Spot takjil ${spot.value.locationName} tersedia!`,
      ogTitle: `${spot.value.locationName} | War Takjil`,
      ogDescription: spot.value.description || `Pantau ketersediaan takjil di ${spot.value.locationName} secara real-time.`,
      ogImage: spot.value.images?.[0]?.url || '/og_image.png',
      twitterTitle: `${spot.value.locationName} | War Takjil`,
      twitterDescription: spot.value.description || `Pantau ketersediaan takjil di ${spot.value.locationName} secara real-time.`,
      twitterImage: spot.value.images?.[0]?.url || '/og_image.png',
    })
  } else {
    useSeoMeta({
      title: 'Memuat Spot...',
      description: 'Memuat data spot takjil...'
    })
  }
})
</script>

<template>
  <main class="min-h-screen bg-background relative">
    <div class="absolute top-4 left-4 z-50">
      <button @click="router.back()"
        class="bg-white/80 dark:bg-black/80 backdrop-blur-md p-2 rounded-full shadow-md text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-black transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>

    <SpotDetailSkeleton v-if="loading" />
    <SpotDetail v-else-if="spot" :spot="spot" />
  </main>
</template>
