<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import LocationPicker from './LocationPicker.vue'
import ImageUploader, { type UploadedImage } from './ImageUploader.vue'
import { encodeGeohash } from '~/utils/geohash'
import { Loader2 } from 'lucide-vue-next'

export interface ReportFormData {
  locationName: string
  status: 'available' | 'low_stock' | 'sold_out'
  priceRange: 'under_10k' | '10k_20k' | 'above_20k' | undefined
  description: string
  images: UploadedImage[]
  location: { latitude: number; longitude: number; geohash: string } | null
  isSellerManaged: boolean
  sellerContact?: string
}

const props = defineProps<{
  isSubmitting?: boolean
  initialData?: Partial<ReportFormData>
}>()

const emit = defineEmits<{
  submit: [data: ReportFormData]
}>()

const formData = ref<ReportFormData>({
  locationName: props.initialData?.locationName || '',
  status: props.initialData?.status || 'available',
  priceRange: props.initialData?.priceRange,
  description: props.initialData?.description || '',
  images: props.initialData?.images || [],
  location: props.initialData?.location || null,
  isSellerManaged: props.initialData?.isSellerManaged || false,
  sellerContact: props.initialData?.sellerContact || ''
})

const isValid = computed(() => {
  return formData.value.locationName.trim() !== '' && 
         formData.value.location !== null &&
         formData.value.status
})

const handleSubmit = () => {
  if (!isValid.value) return
  
  // Ensure geohash is calculated and fresh
  if (formData.value.location) {
    formData.value.location.geohash = encodeGeohash(
      formData.value.location.latitude,
      formData.value.location.longitude
    )
  }
  
  emit('submit', formData.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    
    <!-- Location -->
    <div class="space-y-2">
      <LocationPicker v-model="formData.location" />
    </div>

    <!-- Name -->
    <div class="space-y-2">
      <Label for="locationName">Spot Name <span class="text-red-500">*</span></Label>
      <Input 
        id="locationName" 
        v-model="formData.locationName" 
        placeholder="e.g. Es Kelapa Pak Budi, Gorengan Depan SD" 
        required
      />
    </div>

    <!-- Status -->
    <div class="space-y-3">
      <Label>Current Status <span class="text-red-500">*</span></Label>
      <RadioGroup v-model="formData.status" default-value="available" class="grid grid-cols-3 gap-2">
        <div>
          <RadioGroupItem id="available" value="available" class="peer sr-only" />
          <Label
            for="available"
            class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
          >
            <span class="text-xs font-semibold text-green-600">Available</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem id="low_stock" value="low_stock" class="peer sr-only" />
          <Label
            for="low_stock"
            class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-yellow-500 [&:has([data-state=checked])]:border-yellow-500"
          >
            <span class="text-xs font-semibold text-yellow-600">Low Stock</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem id="sold_out" value="sold_out" class="peer sr-only" />
          <Label
            for="sold_out"
            class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 [&:has([data-state=checked])]:border-red-500"
          >
            <span class="text-xs font-semibold text-red-600">Sold Out</span>
          </Label>
        </div>
      </RadioGroup>
    </div>

    <!-- Photos -->
    <div class="space-y-2">
      <Label>Photos (Max 3)</Label>
      <ImageUploader v-model="formData.images" :max-images="3" />
    </div>

    <!-- Price Range -->
    <div class="space-y-3">
      <Label>Price Range (Optional)</Label>
      <RadioGroup v-model="formData.priceRange" class="grid grid-cols-3 gap-2">
        <div>
          <RadioGroupItem id="under_10k" value="under_10k" class="peer sr-only" />
          <Label
            for="under_10k"
            class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
          >
            <span class="text-[10px] font-medium">&lt; 10k</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem id="10k_20k" value="10k_20k" class="peer sr-only" />
          <Label
            for="10k_20k"
            class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
          >
            <span class="text-[10px] font-medium">10k - 20k</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem id="above_20k" value="above_20k" class="peer sr-only" />
          <Label
            for="above_20k"
            class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
          >
            <span class="text-[10px] font-medium">&gt; 20k</span>
          </Label>
        </div>
      </RadioGroup>
    </div>

    <!-- Notes -->
    <div class="space-y-2">
      <Label for="description">What are they selling? (Optional)</Label>
      <Textarea 
        id="description" 
        v-model="formData.description" 
        placeholder="Kolak, es buah, gorengan hangat..." 
        rows="2"
      />
    </div>

    <!-- Seller Options -->
    <div class="space-y-4 pt-4 border-t">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <Label>I am the seller</Label>
          <p class="text-xs text-muted-foreground">Manage this spot natively and show a verified badge.</p>
        </div>
        <!-- We can use a simple checkbox given Switch is not confirmed to exist perfectly, but let's assume Switch or Checkbox isn't strictly imported unless we do. Let's use a native checkbox styled nicely -->
        <input 
          type="checkbox" 
          v-model="formData.isSellerManaged"
          class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </div>
      
      <div v-if="formData.isSellerManaged" class="space-y-2">
        <Label for="sellerContact">Contact Number (WhatsApp)</Label>
        <Input 
          id="sellerContact" 
          v-model="formData.sellerContact" 
          placeholder="e.g. 08123456789" 
          type="tel"
        />
      </div>
    </div>

    <!-- Submit Action -->
    <Button type="submit" class="w-full" :disabled="!isValid || isSubmitting">
      <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
      {{ isSubmitting ? 'Saving...' : 'Submit Report' }}
    </Button>
  </form>
</template>
