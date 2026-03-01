<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TakjilSpot, SpotComment } from '~/types'
import { useAppAuth } from '~/composables/useAppAuth'
import { useFirestore } from '~/composables/useFirestore'
import { formatRelativeTime } from '~/utils/time'
import { MessageSquare, Send, Trash2, Edit2, X, Check } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { ScrollArea } from '~/components/ui/scroll-area'

const props = defineProps<{
  spot: TakjilSpot
}>()

const { user, isSignedIn } = useAppAuth()
const { addComment, updateComment, deleteComment } = useFirestore()

const newCommentText = ref('')
const isSubmitting = ref(false)
const editingCommentId = ref<string | null>(null)
const editingCommentText = ref('')

const MAX_COMMENTS_PER_USER = 5
const MAX_COMMENT_LENGTH = 150

// Get comments directly from the spot document
const comments = computed(() => {
  if (!props.spot.comments) return []
  // Sort by createdAt desc
  return [...props.spot.comments].sort((a, b) => b.createdAt - a.createdAt)
})

const userCommentCount = computed(() => {
  if (!user.value) return 0
  return comments.value.filter(c => c.userId === user.value?.id).length
})

const canAddComment = computed(() => {
  return isSignedIn.value && userCommentCount.value < MAX_COMMENTS_PER_USER
})

const submitComment = async () => {
  if (!newCommentText.value.trim() || !user.value || !canAddComment.value) return
  if (newCommentText.value.length > MAX_COMMENT_LENGTH) {
    toast.error(`Komentar maksimal ${MAX_COMMENT_LENGTH} karakter`)
    return
  }

  isSubmitting.value = true
  try {
    const comment: SpotComment = {
      id: crypto.randomUUID(),
      userId: user.value.id,
      userName: user.value.fullName || user.value.firstName || 'Pengguna',
      text: newCommentText.value.trim(),
      createdAt: Date.now()
    }

    await addComment(props.spot.id, comment)

    // Optimistically add to UI if needed, or rely on Firestore snapshot listener (currently we pass spot as prop natively, wait for parent to update or force refresh. Assuming parent fetches spots and caches. The reactive spot prop might update if we're listening realtime. If not realtime, we force update it locally to look responsive).
    if (!props.spot.comments) {
      props.spot.comments = []
    }
    props.spot.comments.push(comment)

    newCommentText.value = ''
    toast.success('Komentar berhasil ditambahkan')
  } catch (error) {
    console.error('Failed to add comment:', error)
    toast.error('Gagal menambahkan komentar')
  } finally {
    isSubmitting.value = false
  }
}

const startEdit = (comment: SpotComment) => {
  editingCommentId.value = comment.id
  editingCommentText.value = comment.text
}

const cancelEdit = () => {
  editingCommentId.value = null
  editingCommentText.value = ''
}

const saveEdit = async (oldComment: SpotComment) => {
  if (!editingCommentText.value.trim() || editingCommentText.value === oldComment.text) {
    cancelEdit()
    return
  }

  if (editingCommentText.value.length > MAX_COMMENT_LENGTH) {
    toast.error(`Komentar maksimal ${MAX_COMMENT_LENGTH} karakter`)
    return
  }

  isSubmitting.value = true
  try {
    const newComment: SpotComment = {
      ...oldComment,
      text: editingCommentText.value.trim(),
      updatedAt: Date.now()
    }

    await updateComment(props.spot.id, oldComment, newComment)

    // Optimistic update locally
    if (props.spot.comments) {
      const index = props.spot.comments.findIndex(c => c.id === oldComment.id)
      if (index !== -1) {
        props.spot.comments[index] = newComment
      }
    }

    cancelEdit()
    toast.success('Komentar berhasil diubah')
  } catch (error) {
    console.error('Failed to edit comment:', error)
    toast.error('Gagal mengubah komentar')
  } finally {
    isSubmitting.value = false
  }
}

const removeComment = async (comment: SpotComment) => {
  if (!confirm('Hapus komentar ini?')) return

  try {
    await deleteComment(props.spot.id, comment)

    // Optimistic update
    if (props.spot.comments) {
      props.spot.comments = props.spot.comments.filter(c => c.id !== comment.id)
    }

    toast.success('Komentar berhasil dihapus')
  } catch (error) {
    console.error('Failed to delete comment:', error)
    toast.error('Gagal menghapus komentar')
  }
}
</script>

<template>
  <div class="mt-4 pt-4 border-t dark:border-gray-800">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <MessageSquare class="w-5 h-5" />
        Komentar <span class="text-sm font-normal text-gray-500">({{ comments.length }})</span>
      </h3>
    </div>

    <!-- Comment Form -->
    <div v-if="isSignedIn" class="mb-4">
      <div v-if="canAddComment" class="bg-gray-50 dark:bg-gray-900 p-0 rounded-xl border dark:border-gray-800">
        <textarea v-model="newCommentText" :maxlength="MAX_COMMENT_LENGTH" placeholder="Tulis komentar..."
          class="w-full bg-transparent border-0 focus:ring-0 p-2 text-sm text-gray-900 dark:text-gray-100 resize-none h-16"></textarea>
        <div class="flex justify-between items-center mt-2 p-2 border-t dark:border-gray-800">
          <span class="text-xs" :class="newCommentText.length >= MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-gray-500'">
            {{ newCommentText.length }} / {{ MAX_COMMENT_LENGTH }}
          </span>
          <button @click="submitComment" :disabled="!newCommentText.trim() || isSubmitting"
            class="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            <Send class="w-3.5 h-3.5" />
            Kirim
          </button>
        </div>
      </div>
      <div v-else
        class="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-3 rounded-xl border border-orange-100 dark:border-orange-900/50 text-center">
        Kamu telah mencapai batas maksimal {{ MAX_COMMENTS_PER_USER }} komentar untuk spot ini.
      </div>
    </div>
    <div v-else class="mb-4 text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800">
      <p class="text-sm text-gray-500">Login untuk memberikan komentar.</p>
    </div>

    <!-- Comments List -->
    <ScrollArea v-if="comments.length > 0"
      class="h-[250px] w-full rounded-xl border dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3">
      <div class="flex flex-col gap-3 pr-3">
        <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
          <!-- Avatar Placeholder -->
          <div
            class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-medium text-gray-500">
            {{ comment.userName.charAt(0).toUpperCase() }}
          </div>

          <div
            class="flex-1 bg-white dark:bg-black p-3 rounded-2xl rounded-tl-none border shadow-sm dark:border-gray-800">
            <div class="flex justify-between items-start gap-2 mb-1">
              <span class="font-medium text-sm text-gray-900 dark:text-gray-100">
                {{ comment.userName }}
                <span v-if="comment.userId === spot.createdBy"
                  class="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">Uploader</span>
              </span>
              <span class="text-[10px] text-gray-400 whitespace-nowrap">
                {{ formatRelativeTime(comment.createdAt) }}
                <span v-if="comment.updatedAt">(Diedit)</span>
              </span>
            </div>

            <!-- Edit Mode -->
            <div v-if="editingCommentId === comment.id" class="mt-2">
              <textarea v-model="editingCommentText" :maxlength="MAX_COMMENT_LENGTH"
                class="w-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 resize-none h-16 focus:ring-1 focus:ring-primary"></textarea>
              <div class="flex justify-end gap-2 mt-2">
                <button @click="cancelEdit"
                  class="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <X class="w-4 h-4" />
                </button>
                <button @click="saveEdit(comment)" :disabled="isSubmitting || !editingCommentText.trim()"
                  class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50">
                  <Check class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- View Mode -->
            <p v-else class="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">{{ comment.text
            }}</p>

            <!-- Actions -->
            <div v-if="user?.id === comment.userId && editingCommentId !== comment.id"
              class="flex justify-end gap-3 mt-2 pr-1">
              <button @click="startEdit(comment)"
                class="text-[11px] text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1 font-medium">
                <Edit2 class="w-3 h-3" /> Edit
              </button>
              <button @click="removeComment(comment)"
                class="text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 font-medium">
                <Trash2 class="w-3 h-3" /> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>

    <div v-else class="text-center px-6 py-10 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800">
      <MessageSquare class="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
      <p class="text-sm text-gray-500">Belum ada komentar</p>
    </div>
  </div>
</template>
