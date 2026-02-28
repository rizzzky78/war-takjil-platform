<script setup lang="ts">
import { ref } from 'vue'
import { Camera, X, Loader2, ImagePlus } from 'lucide-vue-next'
import { compressImage } from '~/utils/image'
import { useCloudinary } from '~/composables/useCloudinary'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

export interface UploadedImage {
  url: string
  thumbnailUrl: string
  publicId: string
  type: 'booth' | 'menu'
}

const props = defineProps<{
  modelValue: UploadedImage[]
  maxImages?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [images: UploadedImage[]]
}>()

const maxImages = props.maxImages || 3
const fileInput = ref<HTMLInputElement | null>(null)

const { uploadImage, isUploading, uploadProgress, error } = useCloudinary()

// Handle file selection
const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const selectedFiles = Array.from(target.files)

  // Check limit
  if (props.modelValue.length + selectedFiles.length > maxImages) {
    toast.error(`You can only upload up to ${maxImages} images.`)
    return
  }

  for (const file of selectedFiles) {
    try {
      // 1. Compress
      const compressedFile = await compressImage(file)

      // 2. Upload
      const result = await uploadImage(compressedFile)

      // 3. Emit update
      const newImage: UploadedImage = {
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        publicId: result.publicId,
        type: props.modelValue.length === 0 ? 'booth' : 'menu' // First image is usually booth
      }

      emit('update:modelValue', [...props.modelValue, newImage])
    } catch (err: any) {
      console.error('Failed to upload image:', err)
      toast.error(err.message || 'Failed to upload image')
    }
  }

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeImage = (index: number) => {
  const newImages = [...props.modelValue]
  newImages.splice(index, 1)
  emit('update:modelValue', newImages)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="error" class="text-sm text-red-500 bg-red-50 p-3 rounded-md">
      {{ error }}
    </div>

    <!-- Image Previews Grid -->
    <div v-if="modelValue.length > 0" class="grid grid-cols-3 gap-2">
      <div v-for="(img, idx) in modelValue" :key="img.publicId"
        class="relative aspect-square rounded-md overflow-hidden bg-muted group">
        <img :src="img.thumbnailUrl" alt="Uploaded photo" class="w-full h-full object-cover" />
        <!-- Remove button -->
        <button @click.prevent="removeImage(idx)" type="button"
          class="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
          <X class="w-4 h-4" />
        </button>
        <!-- Type label -->
        <div class="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5 capitalize">
          {{ img.type }}
        </div>
      </div>

      <!-- Add more button if under limit -->
      <button v-if="modelValue.length < maxImages" type="button" @click="triggerFileInput" :disabled="isUploading"
        class="aspect-square flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors disabled:opacity-50">
        <Loader2 v-if="isUploading" class="w-6 h-6 animate-spin text-muted-foreground" />
        <ImagePlus v-else class="w-6 h-6 text-muted-foreground" />
        <span class="text-xs text-muted-foreground font-medium flex gap-1">
          <span v-if="isUploading">{{ uploadProgress }}%</span>
          <span v-else>Add More</span>
        </span>
      </button>
    </div>

    <!-- Empty State / Main Upload Button -->
    <div v-else>
      <div @click="!isUploading && triggerFileInput()"
        class="relative flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        :class="{ 'opacity-50 cursor-not-allowed': isUploading }">
        <div class="p-4 rounded-full bg-primary/10 text-primary">
          <Loader2 v-if="isUploading" class="w-8 h-8 animate-spin" />
          <Camera v-else class="w-8 h-8" />
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-foreground">
            {{ isUploading ? `Uploading... ${uploadProgress}%` : 'Take or upload a photo' }}
          </p>
          <p v-if="!isUploading" class="text-xs text-muted-foreground mt-1">
            Maks {{ maxImages }} foto. Foto pertama adalah foto lapak.
          </p>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/*" class="hidden" multiple @change="onFileSelected" />
  </div>
</template>
