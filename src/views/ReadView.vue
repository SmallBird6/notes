<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ColumnResize from '../components/ColumnResize.vue'
import { loadText, notes, setCurrentPath, titleFor } from '../content/catalog'
import { renderMarkdown } from '../content/render'
import { resolveRoutePath } from '../github/paths'

const route = useRoute()
const html = ref('')
const missing = ref(false)
const articleRef = ref<HTMLElement | null>(null)

async function renderMermaid(root: HTMLElement | null): Promise<void> {
  if (!root) return
  const blocks = Array.from(root.querySelectorAll<HTMLElement>('pre > code.language-mermaid'))
  if (blocks.length === 0) return
  const mermaid = (await import('mermaid')).default
  const dark = document.documentElement.dataset.theme === 'dark'
    || (!document.documentElement.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'default' })
  for (const code of blocks) {
    const source = code.textContent ?? ''
    const host = document.createElement('div')
    host.className = 'mermaid'
    try {
      const id = `mermaid-${Math.random().toString(36).slice(2)}`
      const drawn = await mermaid.render(id, source)
      host.innerHTML = drawn.svg
      code.parentElement?.replaceWith(host)
    } catch (error) {
      const message = error instanceof Error ? error.message : '图形无法绘制'
      host.textContent = message
      code.parentElement?.replaceWith(host)
    }
  }
}

async function show(): Promise<void> {
  if (!notes.commitSha || (notes.loading && notes.entries.length === 0)) return
  const repoPath = resolveRoutePath(route.path, notes.entries)
  setCurrentPath(repoPath)
  const text = await loadText(repoPath)
  if (text === null) {
    missing.value = true
    html.value = ''
    notes.headings = []
    document.title = '这篇还不存在'
    return
  }
  missing.value = false
  const rendered = renderMarkdown(text, {
    currentPath: repoPath,
    entries: notes.entries,
    commitSha: notes.commitSha,
  })
  html.value = rendered.html
  notes.headings = rendered.headings
  document.title = `${titleFor(repoPath)} · 个人文档`
  await nextTick()
  await renderMermaid(articleRef.value)
  if (route.hash) {
    const id = decodeURIComponent(route.hash.slice(1))
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }
}

watch(() => [route.path, notes.commitSha, notes.revision, notes.loading] as const, () => {
  void show()
})

onMounted(() => {
  void show()
})

</script>

<template>
  <article class="article">
    <ColumnResize />
    <p v-if="missing" class="missing">这篇还不存在。</p>
    <div v-else ref="articleRef" class="markdown" v-html="html"></div>
  </article>
</template>
