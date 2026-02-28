import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

export function useCloudinary() {
  const config = useRuntimeConfig()
  const cloudName = config.public.cloudinaryCloudName as string
  const uploadPreset = config.public.cloudinaryUploadPreset as string
  const cloudinaryUrl = config.public.cloudinaryUrl as string

  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)

  /**
   * Upload an image file to Cloudinary using unsigned upload.
   */
  const uploadImage = async (file: File) => {
    isUploading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing. Please check your (.env) variables or Nuxt config.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      // Basic fetch - could use XMLHttpRequest if progress tracking is strictly required
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error?.message || 'Failed to upload image')
      }

      const data = await response.json()

      uploadProgress.value = 100

      return {
        url: data.secure_url,
        thumbnailUrl: getThumbnailUrl(data.public_id),
        publicId: data.public_id,
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isUploading.value = false
    }
  }

  /**
   * Get a Cloudinary transformation URL for thumbnails.
   * Target: 300x300, fill crop, auto format, auto quality.
   */
  const getThumbnailUrl = (publicId: string) => {
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,h_300,w_300,f_auto,q_auto/${publicId}`
  }

  return {
    uploadImage,
    getThumbnailUrl,
    isUploading,
    uploadProgress,
    error
  }
}
