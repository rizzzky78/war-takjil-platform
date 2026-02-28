<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'
</script>

<template>
  <div class="flex flex-col w-full min-h-screen bg-background pb-20">
    <Skeleton class="h-[35vh] w-full rounded-none" />
    <div class="flex flex-col gap-4 p-4 mt-2">
      <div class="flex justify-between items-start">
        <div class="w-2/3">
          <Skeleton class="h-8 w-full" />
          <Skeleton class="h-4 w-2/3 mt-2" />
        </div>
        <Skeleton class="h-6 w-20 rounded-full" />
      </div>

      <Skeleton class="h-16 w-full rounded-md mt-2" />

      <div class="mt-4">
        <Skeleton class="h-6 w-1/3 mb-2" />
        <Skeleton class="h-4 w-full mt-2" />
        <Skeleton class="h-4 w-full mt-2" />
        <Skeleton class="h-4 w-4/5 mt-2" />
      </div>

      <div class="mt-6 pt-4 border-t">
        <Skeleton class="h-6 w-1/2 mb-4" />
        <Skeleton class="h-16 w-full" />
      </div>
    </div>
  </div>
</template>
