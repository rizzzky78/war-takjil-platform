<script setup lang="ts">
import { onMounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { useIndexedDB } from '~/composables/useIndexedDB'
import { useSeoMeta, useHead } from '#imports'

const { cleanupExpiredCache } = useIndexedDB()

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Pantau Takjil Real-time` : 'War Takjil - Pantau Takjil Real-time';
  }
})

useSeoMeta({
  title: 'War Takjil',
  description: 'Aplikasi mobile-first untuk memantau ketersediaan takjil di sekitar Anda secara real-time selama bulan Ramadan.',
  ogTitle: 'War Takjil',
  ogDescription: 'Aplikasi mobile-first untuk memantau ketersediaan takjil di sekitar Anda secara real-time selama bulan Ramadan.',
  ogImage: '/og_image.png',
  ogUrl: 'https://wartakjil.vercel.app',
  twitterTitle: 'War Takjil',
  twitterDescription: 'Pantau ketersediaan takjil di sekitarmu secara real-time!',
  twitterImage: '/og_image.png',
  twitterCard: 'summary_large_image',
})

onMounted(() => {
  cleanupExpiredCache()
})
</script>

<template>
  <div class="bg-black w-full">
    <div
      class="max-w-full lg:max-w-md mx-auto min-h-dvh md:min-h-screen bg-background relative shadow-xl overflow-hidden sm:border-x">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <Toaster />
      <VitePwaManifest />
    </div>
  </div>
</template>
