<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useFirestore } from '~/composables/useFirestore'
import { useAppAuth } from '~/composables/useAppAuth'
import type { TakjilSpot, AbuseReportReason } from '~/types'
import { toast } from 'vue-sonner'

const props = defineProps<{
  spot: TakjilSpot
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'removed'): void
}>()

const { submitAbuseReport } = useFirestore()
const { user } = useAppAuth()

const isSubmitting = ref(false)
const selectedReason = ref<AbuseReportReason>('fraud')
const note = ref('')

const reasons: { value: AbuseReportReason; label: string }[] = [
  { value: 'fraud', label: 'Penipuan (Spot Palsu/Fiktif)' },
  { value: 'misinformation', label: 'Informasi Tidak Sesuai/Menyesatkan' },
  { value: 'inappropriate_image', label: 'Gambar Tidak Pantas/SARA' },
  { value: 'closed_permanently', label: 'Spot Sudah Tutup Permanen' },
  { value: 'other', label: 'Lainnya' },
]

const handleSubmit = async () => {
  if (!user.value?.id) {
    toast.error('Anda harus login untuk melaporkan')
    return
  }

  isSubmitting.value = true
  try {
    const { removed } = await submitAbuseReport(props.spot.id, props.spot, {
      reason: selectedReason.value,
      note: note.value.trim(),
      reportedBy: user.value.id,
      reportedAt: Date.now()
    })

    toast.success('Laporan berhasil dikirim, terima kasih!')

    emit('update:open', false)

    if (removed) {
      toast.info('Spot telah dihapus karena melewati batas laporan maksimal.')
      emit('removed')
    }

    // reset form
    note.value = ''
    selectedReason.value = 'fraud'
  } catch (err: any) {
    console.error('Failed to submit report', err)
    toast.error('Gagal mengirim laporan. Silakan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}

const handleOpenChange = (val: boolean) => {
  emit('update:open', val)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Laporkan Spot</DialogTitle>
        <DialogDescription>
          Laporkan spot ini jika terdapat indikasi penyalahgunaan atau informasi yang tidak sesuai.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <RadioGroup v-model="selectedReason" class="gap-3">
          <div v-for="reason in reasons" :key="reason.value" class="flex items-center space-x-2">
            <RadioGroupItem :value="reason.value" :id="reason.value" />
            <Label :for="reason.value" class="font-normal cursor-pointer">{{ reason.label }}</Label>
          </div>
        </RadioGroup>

        <div class="grid gap-2 mt-2">
          <Label for="note">Catatan Tambahan (Opsional)</Label>
          <Textarea id="note" v-model="note" placeholder="Berikan detail tambahan mengenai laporan ini..."
            class="resize-none" :maxlength="400" rows="3" />
          <span class="text-xs text-right text-gray-500">{{ note.length }}/400</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleOpenChange(false)" :disabled="isSubmitting">
          Batal
        </Button>
        <Button variant="destructive" @click="handleSubmit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
