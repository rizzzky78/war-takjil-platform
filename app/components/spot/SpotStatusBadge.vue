<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '~/components/ui/badge'

const props = defineProps<{
  status: 'available' | 'low_stock' | 'sold_out'
}>()

const statusConfig = computed(() => {
  switch (props.status) {
    case 'available': return { label: 'Tersedia', class: 'bg-green-500 hover:bg-green-600 text-white' }
    case 'low_stock': return { label: 'Menipis', class: 'bg-yellow-500 hover:bg-yellow-600 text-white' }
    case 'sold_out': return { label: 'Habis', class: 'bg-red-500 hover:bg-red-600 text-white' }
    default: return { label: 'Unknown', class: 'bg-gray-500 text-white' }
  }
})
</script>

<template>
  <Badge :class="statusConfig.class">
    {{ statusConfig.label }}
  </Badge>
</template>
