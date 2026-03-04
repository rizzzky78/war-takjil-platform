<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import privacyMarkdown from '~/assets/content/privacy.md?raw'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const parsedHtml = ref('')

onMounted(() => {
  parsedHtml.value = marked.parse(privacyMarkdown) as string
})
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header -->
    <header
      class="sticky top-0 z-50 bg-[#022c22] border-b border-primary/20 backdrop-blur supports-[backdrop-filter]:bg-[#022c22]/80">
      <div class="flex items-center h-14 px-4 gap-3">
        <button @click="router.back()" class="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white"
          aria-label="Kembali">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-lg font-bold text-white tracking-tight">Kebijakan Privasi</h1>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto px-4 py-6">
      <div class="prose-content text-foreground/90 max-w-none" v-html="parsedHtml"></div>
    </main>
  </div>
</template>

<style>
/* Custom lightweight prose styling */
.prose-content {
  font-family: inherit;
  line-height: 1.6;
}

.prose-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-foreground);
}

.prose-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--color-foreground);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.25rem;
}

.prose-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--color-foreground);
}

.prose-content p {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.prose-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose-content li {
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
}

.prose-content strong {
  font-weight: 600;
  color: var(--color-foreground);
}
</style>
