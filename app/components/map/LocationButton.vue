<script setup lang="ts">
import { Crosshair } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  isLocated: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div class="absolute md:bottom-24 bottom-28 right-6 z-[20]">
    <Button size="icon"
      class="rounded-full size-12 shadow-lg bg-white text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 pointer-events-auto"
      @click="emit('click')" :class="{ 'text-primary': isLocated }">
      <Crosshair class="h-6 w-6" />
    </Button>
  </div>
</template>
