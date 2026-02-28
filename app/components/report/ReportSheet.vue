<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import ReportForm, { type ReportFormData } from './ReportForm.vue'
import { useAppAuth } from '~/composables/useAppAuth'
import { useFirestore } from '~/composables/useFirestore'
import { useSpots } from '~/composables/useSpots'
import type { TakjilSpot, SpotReport } from '~/types'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  mode?: 'create' | 'update'
  existingSpot?: TakjilSpot
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': [spot: TakjilSpot | string]
}>()

const isSubmitting = ref(false)
const { user, isSignedIn, signIn } = useAppAuth()
const { addSpot, updateSpot, addReport } = useFirestore()
const { fetchSpots } = useSpots()

// Map TakjilSpot to ReportFormData if updating
const initialData = computed<Partial<ReportFormData>>(() => {
  if (props.mode === 'update' && props.existingSpot) {
    return {
      locationName: props.existingSpot.locationName,
      status: props.existingSpot.status,
      priceRange: props.existingSpot.priceRange,
      description: props.existingSpot.description,
      images: props.existingSpot.images,
      location: props.existingSpot.location
    }
  }
  return {}
})

const onSubmit = async (data: ReportFormData) => {
  if (!isSignedIn.value || !user.value) {
    toast.error('Please login to continue')
    return
  }

  if (!data.location) {
    toast.error('Location is required')
    return
  }

  isSubmitting.value = true
  try {
    const now = Date.now()
    const twoHoursRef = now + 2 * 60 * 60 * 1000 // 2 hours TTL

    // Prepare images with metadata
    const mappedImages = data.images.map(img => ({
      ...img,
      uploadedAt: now,
      uploadedBy: user.value!.id
    }))

    if (props.mode === 'update' && props.existingSpot) {
      // 1. Add report
      const reportId = await addReport(props.existingSpot.id, {
        status: data.status,
        note: data.description,
        images: mappedImages,
        reportedBy: user.value.id,
        reportedAt: now,
        isVerified: false,
        expiresAt: twoHoursRef
      })

      // 2. Update spot
      await updateSpot(props.existingSpot.id, {
        status: data.status,
        lastStatusUpdate: now,
        lastReportedAt: now,
        reportCount: props.existingSpot.reportCount + 1,
        // Update images if new ones were added (or just append)
        images: mappedImages,
        description: data.description,
        priceRange: data.priceRange,
        isSellerManaged: data.isSellerManaged,
        sellerContact: data.sellerContact,
        expiresAt: twoHoursRef
      })

      toast.success('Spot updated successfully!')
      emit('success', props.existingSpot.id)
    } else {
      // Create new spot
      const spotId = await addSpot({
        location: data.location,
        locationName: data.locationName,
        status: data.status,
        lastStatusUpdate: now,
        description: data.description,
        priceRange: data.priceRange,
        images: mappedImages,
        createdAt: now,
        createdBy: user.value.id,
        reportCount: 1,
        lastReportedAt: now,
        isSellerManaged: data.isSellerManaged,
        sellerContact: data.sellerContact,
        expiresAt: twoHoursRef
      })

      toast.success('Spot added successfully!')
      emit('success', spotId)
    }

    // Refresh spots for current location, forcing a cache bypass with 5000m radius to match map
    await fetchSpots(data.location.latitude, data.location.longitude, 5000, true)

    // Close sheet
    emit('update:open', false)
  } catch (error) {
    console.error('Failed to submit report', error)
    toast.error('Failed to submit report. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto max-w-md md:px-4 pb-8 pt-6 rounded-xl lg:max-w-md">
      <DialogHeader class="mb-4 text-left">
        <DialogTitle class="text-xl">
          {{ mode === 'update' ? 'Update Takjil Spot' : 'Add New Takjil Spot' }}
        </DialogTitle>
        <DialogDescription v-if="mode === 'create'" class="text-xs">
          Help others find good takjil! This pin will disappear automatically after 2 hours.
        </DialogDescription>
        <DialogDescription v-else class="text-xs">
          Update the status of this spot to help others know if it's still available.
        </DialogDescription>
      </DialogHeader>

      <div v-if="!isSignedIn"
        class="p-6 text-center border rounded-lg bg-muted flex flex-col items-center justify-center space-y-3">
        <p class="text-sm font-medium">You must be logged in to report spots.</p>
        <div class="flex w-full gap-2 mt-2">
          <Button variant="outline" class="flex-1" @click="() => $emit('update:open', false)">Cancel</Button>
          <Button class="flex-1" @click="() => signIn()">Sign In / Register</Button>
          <!-- Show the user button when the user is signed in -->
        </div>
      </div>

      <ReportForm v-else :initial-data="initialData" :is-submitting="isSubmitting" @submit="onSubmit" />
    </DialogContent>
  </Dialog>
</template>
