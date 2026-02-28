<script setup lang="ts">
import { onMounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { useIndexedDB } from '~/composables/useIndexedDB'

const { cleanupExpiredCache } = useIndexedDB()

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
