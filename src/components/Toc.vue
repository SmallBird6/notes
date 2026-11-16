<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Heading } from '../content/render'

const props = defineProps<{ headings: Heading[] }>()
const current = ref('')

function markCurrent(): void {
  const offset = 88
  let active = props.headings[0]?.slug ?? ''
  for (const heading of props.headings) {
    const element = document.getElementById(heading.slug)
    if (!element) continue
    if (element.getBoundingClientRect().top - offset <= 0) active = heading.slug
  }
  current.value = active
}

watch(() => props.headings, () => {
  current.value = props.headings[0]?.slug ?? ''
  requestAnimationFrame(markCurrent)
})

onMounted(() => {
  markCurrent()
  window.addEventListener('scroll', markCurrent, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', markCurrent)
})
</script>

<template>
  <aside class="toc">
    <p class="toc-title">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M3 4.5h10M3 8h10M3 11.5h7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      </svg>
      在本页
    </p>
    <p v-if="headings.length === 0" class="sidebar-note">这篇没有标题</p>
    <ul v-else>
      <li v-for="heading in headings" :key="heading.slug + heading.text" :style="{ paddingLeft: `${Math.max(0, heading.level - 2) * 12}px` }">
        <a :href="'#' + heading.slug" :class="{ active: current === heading.slug }">{{ heading.text }}</a>
      </li>
    </ul>
  </aside>
</template>
