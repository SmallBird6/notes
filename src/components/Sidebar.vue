<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { buildTree, notes, type TreeNode } from '../content/catalog'

const emit = defineEmits<{ create: [folder: string] }>()

const route = useRoute()
const collapsed = ref(new Set<string>())
const menu = ref<{ key: string; folder: string; top: number; left: number; above: boolean } | null>(null)

const tree = computed(() => {
  void notes.revision
  return buildTree(notes.entries, notes.texts)
})

const rows = computed(() => {
  const list: { node: TreeNode; depth: number; key: string; folder: string }[] = []
  const walk = (nodes: TreeNode[], depth: number, prefix: string) => {
    for (const node of nodes) {
      const key = node.path ?? `${prefix}/${node.name}`
      const parent = prefix === 'root' ? '' : prefix.slice('root/'.length)
      const folder = node.kind === 'dir' ? (parent ? `${parent}/${node.name}` : node.name) : ''
      list.push({ node, depth, key, folder })
      if (node.kind === 'dir' && !collapsed.value.has(key)) walk(node.children, depth + 1, key)
    }
  }
  walk(tree.value, 0, 'root')
  return list
})

const activePath = computed(() => route.path)

function toggle(key: string): void {
  const next = new Set(collapsed.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  collapsed.value = next
  menu.value = null
}

function isActive(node: TreeNode): boolean {
  return node.route === activePath.value
}

function createIn(folder: string): void {
  menu.value = null
  emit('create', folder)
}

function toggleMenu(event: MouseEvent, row: { key: string; folder: string }): void {
  event.stopPropagation()
  if (menu.value?.key === row.key) {
    menu.value = null
    return
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const above = rect.bottom + 48 > window.innerHeight
  menu.value = {
    key: row.key,
    folder: row.folder,
    top: above ? rect.top - 4 : rect.bottom + 4,
    left: rect.right,
    above,
  }
}

function onPointerDown(event: PointerEvent): void {
  const target = event.target
  if (!(target instanceof Element)) {
    menu.value = null
    return
  }
  if (target.closest('.tree-menu') || target.closest('.tree-more')) return
  menu.value = null
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <aside class="sidebar">
    <p v-if="notes.truncated" class="sidebar-note">仓库文件过多，本次无法列全</p>
    <p v-else-if="notes.loading && rows.length === 0" class="sidebar-note">正在读取目录</p>
    <p v-else-if="rows.length === 0" class="sidebar-note">还没有文章</p>
    <ul v-else class="tree">
      <li v-for="row in rows" :key="row.key">
        <div
          v-if="row.node.kind === 'dir'"
          class="tree-row"
          :style="{ paddingLeft: `${6 + row.depth * 16}px` }"
        >
          <button
            class="tree-chevron"
            type="button"
            :aria-expanded="!collapsed.has(row.key)"
            :aria-label="collapsed.has(row.key) ? '展开' : '收起'"
            @click="toggle(row.key)"
          >
            <svg class="chevron" :class="{ open: !collapsed.has(row.key) }" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button class="tree-folder" type="button" @click="toggle(row.key)">
            <span class="tree-name">{{ row.node.title }}</span>
          </button>
          <span class="tree-actions">
            <button class="tree-action" type="button" aria-label="新建文章" @click="createIn(row.folder)">+</button>
            <button
              class="tree-action tree-more"
              type="button"
              aria-label="更多"
              :aria-expanded="menu?.key === row.key"
              @click="toggleMenu($event, row)"
            >…</button>
          </span>
        </div>
        <RouterLink
          v-else
          :to="row.node.route || '/'"
          class="tree-row tree-link"
          :class="{ active: isActive(row.node) }"
          :style="{ paddingLeft: `${22 + row.depth * 14}px` }"
        >
          <span class="tree-name">{{ row.node.title }}</span>
        </RouterLink>
      </li>
    </ul>
    <Teleport to="body">
      <div
        v-if="menu"
        class="tree-menu"
        :class="{ above: menu.above }"
        :style="{ top: `${menu.top}px`, left: `${menu.left}px` }"
      >
        <button type="button" @click="createIn(menu.folder)">新建文章</button>
      </div>
    </Teleport>
  </aside>
</template>
