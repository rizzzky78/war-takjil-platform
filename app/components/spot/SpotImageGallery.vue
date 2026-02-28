<script setup lang="ts">
defineProps<{
  images?: Array<{
    url: string
    thumbnailUrl: string
  }>
}>()
</script>

<template>
  <div v-if="images && images.length" class="w-full relative bg-black">
    <div class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
      <div 
        v-for="(img, idx) in images" 
        :key="idx"
        class="flex-none w-full h-[35vh] snap-center relative"
      >
        <img :src="img.url" alt="Spot image" class="w-full h-full object-cover" />
      </div>
    </div>
    <div v-if="images.length > 1" class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
      Geser untuk melihat gambar lain
    </div>
  </div>
  <div v-else class="w-full h-[35vh] bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400">
    <div class="text-5xl mb-2">🍽️</div>
    <div class="text-sm border p-2 rounded-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
      Belum ada foto
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
