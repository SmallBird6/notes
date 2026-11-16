<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBox from './components/SearchBox.vue'
import Sidebar from './components/Sidebar.vue'
import Toc from './components/Toc.vue'
import TokenDialog from './components/TokenDialog.vue'
import UploadButton from './components/UploadButton.vue'
import { contentDir, githubBranch, githubOwner, githubRepo, THEME_STORAGE_KEY } from './config'
import { buildTree, entryByPath, flattenArticles, markLoggedOut, notes, refresh, removePath } from './content/catalog'
import { explainError } from './github/client'
import { isWritablePath, repoPathToEditRoute, writablePath } from './github/paths'
import { bodyFontSize, MAX_BODY_FONT_SIZE, MIN_BODY_FONT_SIZE, stepBodyFontSize } from './session/reading'
import { clearToken } from './session/token'
import { sidebarOpen, tokenDialogOpen } from './session/ui'

const route = useRoute()
const router = useRouter()
type ThemeChoice = 'system' | 'light' | 'dark'
const theme = ref<ThemeChoice>(readTheme())
const showNew = ref(false)
const newPath = ref('')
const newError = ref('')
const editing = computed(() => route.path === '/edit' || route.path.startsWith('/edit/'))

const themeLabel = computed(() => {
  if (theme.value === 'light') return '浅色'
  if (theme.value === 'dark') return '深色'
  return '跟随系统'
})

function readTheme(): ThemeChoice {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  return 'system'
}

function applyTheme(): void {
  if (theme.value === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme.value
  localStorage.setItem(THEME_STORAGE_KEY, theme.value)
}

function cycleTheme(): void {
  theme.value = theme.value === 'system' ? 'light' : theme.value === 'light' ? 'dark' : 'system'
  applyTheme()
}

applyTheme()

function logout(): void {
  clearToken()
  markLoggedOut()
}

function editCurrent(): void {
  if (!notes.currentPath) return
  void router.push(repoPathToEditRoute(notes.currentPath))
}

async function removeCurrent(): Promise<void> {
  const path = notes.currentPath
  if (!path || !isWritablePath(path)) return
  if (!window.confirm(`确定删除 ${path}？`)) return
  const articles = flattenArticles(buildTree(notes.entries, notes.texts)).filter((article) => article.path !== path)
  const current = flattenArticles(buildTree(notes.entries, notes.texts))
  const index = current.findIndex((article) => article.path === path)
  const neighbor = current[index + 1] ?? current[index - 1]
  try {
    await removePath(path)
    const target = neighbor && articles.some((article) => article.path === neighbor.path) ? neighbor.route ?? '/' : '/'
    await router.push(target || '/')
  } catch (error) {
    notes.error = explainError(error)
  }
}

function beginNew(folder: string): void {
  if (!notes.tokenOk) {
    tokenDialogOpen.value = true
    return
  }
  const prefix = folder.trim().replace(/^\/+|\/+$/g, '')
  newPath.value = prefix ? `${prefix}/` : ''
  newError.value = ''
  showNew.value = true
}

function createPage(): void {
  const relative = newPath.value.trim().replace(/^\/+/, '').normalize('NFC')
  if (!relative.toLowerCase().endsWith('.md')) {
    newError.value = '路径必须以 .md 结尾'
    return
  }
  const full = writablePath(`${contentDir}/${relative}`)
  if (!full) {
    newError.value = '路径不合法或内容超过限制'
    return
  }
  newError.value = ''
  showNew.value = false
  newPath.value = ''
  if (entryByPath(full)) {
    void router.push(repoPathToEditRoute(full))
    return
  }
  void router.push(repoPathToEditRoute(full))
}

watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <button class="menu" type="button" @click="sidebarOpen = !sidebarOpen">目录</button>
      <RouterLink to="/" class="brand">个人文档</RouterLink>
      <div class="top-actions">
        <button type="button" :disabled="notes.loading" @click="refresh(true)">{{ notes.loading ? '读取中' : '刷新' }}</button>
        <div class="type-size" role="group" aria-label="正文字号">
          <button type="button" aria-label="减小字号" :disabled="bodyFontSize <= MIN_BODY_FONT_SIZE" @click="stepBodyFontSize(-1)">A-</button>
          <span>{{ bodyFontSize }}</span>
          <button type="button" aria-label="增大字号" :disabled="bodyFontSize >= MAX_BODY_FONT_SIZE" @click="stepBodyFontSize(1)">A+</button>
        </div>
        <button type="button" @click="cycleTheme">{{ themeLabel }}</button>
        <template v-if="notes.tokenOk">
          <button type="button" @click="beginNew('')">新建</button>
          <UploadButton />
          <button v-if="!editing" type="button" @click="editCurrent">编辑</button>
          <button type="button" @click="removeCurrent">删除</button>
          <button type="button" @click="logout">退出</button>
        </template>
        <button v-else type="button" @click="tokenDialogOpen = true">登录</button>
      </div>
      <SearchBox />
    </header>
    <p v-if="notes.error" class="banner">{{ notes.error }}</p>
    <div class="app" :class="{ editing, 'sidebar-open': sidebarOpen }">
      <Sidebar @create="beginNew" />
      <main class="center">
        <router-view />
      </main>
      <Toc v-if="!editing" :headings="notes.headings" />
    </div>
    <footer class="footer">{{ githubOwner }}/{{ githubRepo }} @ {{ githubBranch }} · {{ contentDir }}/</footer>
    <TokenDialog v-if="tokenDialogOpen" @close="tokenDialogOpen = false" />
    <div v-if="showNew" class="modal-backdrop" @click.self="showNew = false">
      <form class="modal" @submit.prevent="createPage">
        <h2>新建文章</h2>
        <p>填写相对 {{ contentDir }}/ 的路径，必须以 .md 结尾。路径已存在时会打开编辑，不会直接覆盖。</p>
        <label>
          路径
          <input v-model="newPath" type="text" placeholder="guide/新笔记.md" autocomplete="off" />
        </label>
        <p v-if="newError" class="error">{{ newError }}</p>
        <div class="modal-actions">
          <button class="primary" type="submit">打开</button>
          <button type="button" @click="showNew = false">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>
