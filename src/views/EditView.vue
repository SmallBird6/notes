<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { notes, reloadConflict, saveText, setCurrentPath } from '../content/catalog'
import { explainError, fetchRawText, GitHubError } from '../github/client'
import { editRouteToRepoPath, initialDocument, isWritablePath } from '../github/paths'
import { requestLogin } from '../session/ui'

const route = useRoute()
const host = ref<HTMLElement | null>(null)
const view = shallowRef<EditorView | null>(null)
const savedText = ref('')
const status = ref('')
const loadedPath = ref('')
const repoPath = computed(() => editRouteToRepoPath(route.path))
const dirty = computed(() => (view.value ? view.value.state.doc.toString() : '') !== savedText.value)

function lineSeparator(text: string): string | undefined {
  return text.includes('\r\n') ? '\r\n' : undefined
}

function mountEditor(text: string): void {
  view.value?.destroy()
  if (!host.value) return
  const separator = lineSeparator(text)
  const state = EditorState.create({
    doc: text,
    extensions: [
      ...(separator ? [EditorState.lineSeparator.of(separator)] : []),
      lineNumbers(),
      history(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      markdown(),
      keymap.of([
        ...historyKeymap,
        ...defaultKeymap,
        { key: 'Mod-s', run: () => { void save(); return true } },
      ]),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': { backgroundColor: 'var(--paper)', color: 'var(--text)', fontSize: '15px' },
        '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', minHeight: '70vh', padding: '12px 0' },
        '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--muted)', border: 'none' },
        '&.cm-focused': { outline: 'none' },
      }),
    ],
  })
  view.value = new EditorView({ state, parent: host.value })
}

function adopt(path: string, text: string, message: string): void {
  loadedPath.value = path
  savedText.value = text
  status.value = message
  mountEditor(text)
}

async function open(): Promise<void> {
  const path = repoPath.value
  if (!isWritablePath(path)) {
    status.value = '路径不合法或内容超过限制'
    savedText.value = ''
    loadedPath.value = path
    mountEditor('')
    return
  }
  setCurrentPath(path)
  if (!notes.tokenOk) requestLogin()
  if (loadedPath.value === path && view.value) return
  if (!notes.commitSha) return
  const existing = notes.entries.find((entry) => entry.path === path)
  if (!existing) {
    adopt(path, initialDocument(path), '这篇还不存在，保存后会新建。')
    return
  }
  const cached = notes.texts.get(path)
  if (cached !== undefined) {
    adopt(path, cached, '')
    return
  }
  try {
    const text = await fetchRawText(notes.commitSha, path)
    notes.texts.set(path, text)
    notes.revision += 1
    adopt(path, text, '')
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) {
      adopt(path, initialDocument(path), '这篇还不存在，保存后会新建。')
      return
    }
    status.value = explainError(error)
  }
}

async function save(): Promise<void> {
  const path = repoPath.value
  if (!view.value) return
  if (!notes.tokenOk) {
    requestLogin()
    status.value = '请先登录'
    return
  }
  if (!isWritablePath(path)) {
    status.value = '路径不合法或内容超过限制'
    return
  }
  const text = view.value.state.doc.toString()
  status.value = '正在保存'
  try {
    await saveText(path, text)
    savedText.value = text
    loadedPath.value = path
    status.value = '已保存'
  } catch (error) {
    if (error instanceof GitHubError && error.status === 409) {
      try {
        await reloadConflict(path)
      } catch (reloadError) {
        status.value = explainError(reloadError)
        return
      }
      status.value = explainError(error)
      return
    }
    status.value = explainError(error)
  }
}

watch(() => [route.path, notes.commitSha] as const, () => {
  void open()
})

onMounted(() => {
  void open()
})

onBeforeUnmount(() => {
  view.value?.destroy()
})

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  return window.confirm('有未保存的修改，确定离开？')
})

function onLeave(event: BeforeUnloadEvent): void {
  if (!dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}

window.addEventListener('beforeunload', onLeave)
onBeforeUnmount(() => window.removeEventListener('beforeunload', onLeave))

defineExpose({ save })
</script>

<template>
  <section class="editor-pane">
    <div class="editor-bar">
      <p class="editor-path">{{ repoPath || '未选择文章' }}</p>
      <button type="button" class="primary" :disabled="notes.saving || !repoPath" @click="save">
        {{ notes.saving ? '正在保存' : '保存' }}
      </button>
    </div>
    <p v-if="status" class="status">{{ status }}</p>
    <div ref="host" class="editor-host"></div>
  </section>
</template>
