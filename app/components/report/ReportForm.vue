<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import LocationPicker from './LocationPicker.vue'
import ImageUploader, { type UploadedImage } from './ImageUploader.vue'
import { encodeGeohash } from '~/utils/geohash'
import { Loader2 } from 'lucide-vue-next'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

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

const formSchema = toTypedSchema(z.object({
  locationName: z.string().min(3, { message: 'Nama spot harus diisi minimal 3 karakter' }).max(40, { message: 'Nama spot maksimal 40 karakter' }),
  status: z.enum(['available', 'low_stock', 'sold_out'], { required_error: 'Status wajib dipilih' }),
  priceRange: z.enum(['under_10k', '10k_20k', 'above_20k'], { required_error: 'Estimasi harga wajib dipilih' }),
  description: z.string().max(250, { message: 'Deskripsi maksimal 250 karakter' }).optional(),
  images: z.array(z.any()).max(3, { message: 'Maksimal 3 foto' }).optional().default([]),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    geohash: z.string().optional()
  }).nullable().refine((val) => val !== null, { message: 'Lokasi wajib dipilih' }),
  isSellerManaged: z.boolean().default(false),
  sellerContact: z.string().optional(),
  userAgreement: z.boolean().refine((val) => val === true, {
    message: '*Kamu harus menyetujui pernyataan ini'
  })
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    locationName: props.initialData?.locationName || '',
    status: props.initialData?.status || 'available',
    priceRange: props.initialData?.priceRange,
    description: props.initialData?.description || '',
    images: props.initialData?.images || [],
    location: props.initialData?.location || null,
    isSellerManaged: props.initialData?.isSellerManaged || false,
    sellerContact: props.initialData?.sellerContact || '',
    userAgreement: false,
  },
})

const onSubmit = form.handleSubmit((values) => {
  // Ensure geohash is calculated and fresh
  if (values.location) {
    values.location.geohash = encodeGeohash(
      values.location.latitude,
      values.location.longitude
    )
  }

  emit('submit', values as unknown as ReportFormData)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">

    <!-- Location -->
    <FormField name="location" v-slot="{ componentField }">
      <FormItem class="space-y-2">
        <FormControl>
          <LocationPicker :model-value="componentField.modelValue ?? null"
            @update:model-value="componentField.onChange" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Name -->
    <FormField name="locationName" v-slot="{ componentField }">
      <FormItem class="space-y-2">
        <FormLabel>Nama Spot <span class="text-red-500">*</span></FormLabel>
        <FormControl>
          <Input v-bind="componentField" placeholder="e.g. Es Kelapa Pak Budi, Gorengan Depan SD" :maxlength="40" />
        </FormControl>
        <FormMessage class="-mt-2 text-xs" />
      </FormItem>
    </FormField>

    <!-- Status -->
    <FormField name="status" v-slot="{ componentField }">
      <FormItem class="space-y-3">
        <FormLabel>Status Saat Ini <span class="text-red-500">*</span></FormLabel>
        <FormControl>
          <RadioGroup v-bind="componentField" class="grid grid-cols-3 gap-2">
            <div>
              <RadioGroupItem id="available" value="available" class="peer sr-only" />
              <Label for="available"
                class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500">
                <span class="text-xs font-semibold text-green-600">Tersedia</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem id="low_stock" value="low_stock" class="peer sr-only" />
              <Label for="low_stock"
                class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-yellow-500 [&:has([data-state=checked])]:border-yellow-500">
                <span class="text-xs font-semibold text-yellow-600">Hampir Habis</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem id="sold_out" value="sold_out" class="peer sr-only" />
              <Label for="sold_out"
                class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 [&:has([data-state=checked])]:border-red-500">
                <span class="text-xs font-semibold text-red-600">Habis</span>
              </Label>
            </div>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Photos -->
    <FormField name="images" v-slot="{ componentField }">
      <FormItem class="space-y-2">
        <FormLabel>Foto (Maks 3)</FormLabel>
        <FormControl>
          <ImageUploader :model-value="componentField.modelValue ?? []" @update:model-value="componentField.onChange"
            :max-images="3" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Price Range -->
    <FormField name="priceRange" v-slot="{ componentField }">
      <FormItem class="space-y-3">
        <FormLabel>Kisaran Harga <span class="text-red-500">*</span></FormLabel>
        <FormControl>
          <RadioGroup v-bind="componentField" class="grid grid-cols-3 gap-2">
            <div>
              <RadioGroupItem id="under_10k" value="under_10k" class="peer sr-only" />
              <Label for="under_10k"
                class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary">
                <span class="text-xs font-medium">&lt; 10k</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem id="10k_20k" value="10k_20k" class="peer sr-only" />
              <Label for="10k_20k"
                class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary">
                <span class="text-xs font-medium">10k - 20k</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem id="above_20k" value="above_20k" class="peer sr-only" />
              <Label for="above_20k"
                class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary">
                <span class="text-xs font-medium">&gt; 20k</span>
              </Label>
            </div>
          </RadioGroup>
        </FormControl>
        <FormMessage class="-mt-2 text-xs" />
      </FormItem>
    </FormField>

    <!-- Notes -->
    <FormField name="description" v-slot="{ componentField }">
      <FormItem class="space-y-2">
        <FormLabel>Jualan apa? (Opsional)</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="Kolak, es buah, gorengan hangat..." rows="2"
            :maxlength="250" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Seller Options -->
    <FormField name="isSellerManaged" v-slot="{ componentField }">
      <FormItem class="space-y-4 pt-4 border-t">
        <div class="flex items-start gap-3">
          <FormControl>
            <input id="isSellerManaged" type="checkbox" :checked="componentField.modelValue"
              @change="componentField.onChange && componentField.onChange(($event.target as HTMLInputElement).checked)"
              class="size-4 rounded border-gray-300 text-primary focus:ring-primary" />
          </FormControl>
          <div class="space-y-0.5">
            <FormLabel for="isSellerManaged">Saya adalah penjual</FormLabel>
            <p class="text-xs text-muted-foreground">Kelola spot ini secara native dan dapatkan badge terverifikasi.</p>
          </div>
        </div>

        <FormField v-if="componentField.modelValue" name="sellerContact" v-slot="{ componentField: contactField }">
          <FormItem class="space-y-2">
            <FormLabel>Nomor Kontak (WhatsApp)</FormLabel>
            <FormControl>
              <Input v-bind="contactField" placeholder="e.g. 08123456789" type="tel" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </FormItem>
    </FormField>

    <!-- User Agreement -->
    <FormField name="userAgreement" v-slot="{ componentField }">
      <FormItem class="pt-2">
        <div class="flex items-start gap-3">
          <FormControl>
            <input id="userAgreement" type="checkbox" :checked="componentField.modelValue"
              @change="componentField.onChange && componentField.onChange(($event.target as HTMLInputElement).checked)"
              class="size-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0" />
          </FormControl>
          <FormLabel for="userAgreement"
            class="text-xs font-normal leading-snug cursor-pointer text-gray-700 dark:text-gray-300 break-words w-full">
            Saya menyatakan bahwa informasi yang saya kirimkan adalah benar sesuai kondisi saat ini, dikirim dengan
            itikad
            baik, dan saya bertanggung jawab penuh atas laporan tersebut.
          </FormLabel>
        </div>
        <FormMessage class="-mt-2 text-xs" />
      </FormItem>
    </FormField>

    <!-- Submit Action -->
    <Button type="submit" class="w-full" :disabled="isSubmitting">
      <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
      {{ isSubmitting ? 'Menyimpan...' : 'Kirim Laporan' }}
    </Button>
  </form>
</template>
