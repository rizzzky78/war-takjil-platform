import Compressor from 'compressorjs'

/**
 * Compresses an image file before uploading to Cloudinary.
 * Target: Max 1920px (longer side), 80% quality, WebP format.
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      mimeType: 'image/webp',
      success(result: File | Blob) {
        const finalFile = result instanceof File
          ? result
          : new File([result], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' })
        resolve(finalFile)
      },
      error(err: Error) {
        reject(err)
      },
    })
  })
}
