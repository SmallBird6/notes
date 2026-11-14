<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { buildTree, notes, type TreeNode } from '../content/catalog'

const route = useRoute()
const collapsed = ref(new Set<string>())

const tree = computed(() => {
  void notes.revision
  return buildTree(notes.entries, notes.texts)
})

const rows = computed(() => {
  const list: { node: TreeNode; depth: number; key: string }[] = []
  const walk = (nodes: TreeNode[], depth: number, prefix: string) => {
    for (const node of nodes) {
      const key = node.path ?? `${prefix}/${node.name}`
      list.push({ node, depth, key })
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
}

function isActive(node: TreeNode): boolean {
  return node.route === activePath.value
}
</script>

<template>
  <aside class="sidebar">
    <p v-if="notes.truncated" class="sidebar-note">仓库文件过多，本次无法列全</p>
    <p v-else-if="notes.loading && rows.length === 0" class="sidebar-note">正在读取目录</p>
    <p v-else-if="rows.length === 0" class="sidebar-note">还没有文章</p>
    <ul v-else class="tree">
      <li v-for="row in rows" :key="row.key">
        <button
          v-if="row.node.kind === 'dir'"
          class="tree-dir"
          :style="{ paddingLeft: `${12 + row.depth * 14}px` }"
          type="button"
          @click="toggle(row.key)"
        >
          {{ collapsed.has(row.key) ? '▸' : '▾' }} {{ row.node.title }}
        </button>
        <RouterLink
          v-else
          :to="row.node.route || '/'"
          class="tree-link"
          :class="{ active: isActive(row.node) }"
          :style="{ paddingLeft: `${12 + row.depth * 14}px` }"
        >
          {{ row.node.title }}
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>
