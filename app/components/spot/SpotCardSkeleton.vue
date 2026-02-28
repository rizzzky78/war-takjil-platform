<script setup lang="ts">
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
</script>

<template>
  <div class="fixed bottom-4 left-4 right-4 z-[1000]">
    <Card class="w-full shadow-xl border-t-4 border-t-gray-200 dark:border-t-gray-700">
      <div class="flex p-4 gap-4 items-center">
        <Skeleton class="w-20 h-20 rounded-md flex-shrink-0" />
        <div class="flex-1 min-w-0 flex flex-col gap-2">
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-full" />
          <div class="flex gap-2 mt-1">
            <Skeleton class="h-5 w-16 rounded-full" />
            <Skeleton class="h-4 w-20" />
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
