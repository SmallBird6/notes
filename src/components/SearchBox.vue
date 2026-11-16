<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { notes, searchNotes, type SearchHit } from '../content/catalog'

const router = useRouter()
const draft = ref('')
const query = ref('')
const open = ref(false)
const hits = ref<SearchHit[]>([])
let timer = 0

function onInput(event: Event): void {
  draft.value = (event.target as HTMLInputElement).value
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    query.value = draft.value
  }, 150)
}

watch([query, () => notes.revision], () => {
  hits.value = searchNotes(query.value)
  open.value = query.value.trim().length > 0
})

function go(hit: SearchHit): void {
  open.value = false
  draft.value = ''
  query.value = ''
  void router.push(hit.route)
}
</script>

<template>
  <div class="search">
    <svg class="search-icon" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.4" />
      <path d="M10.2 10.2L13 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </svg>
    <input
      :value="draft"
      type="search"
      placeholder="搜索…"
      aria-label="搜索"
      @input="onInput"
      @focus="open = query.trim().length > 0"
    />
    <ul v-if="open" class="search-results">
      <li v-if="hits.length === 0">没有匹配</li>
      <li v-for="hit in hits" :key="hit.path">
        <button type="button" @click="go(hit)">
          <strong>{{ hit.title }}</strong>
          <span>{{ hit.line }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
