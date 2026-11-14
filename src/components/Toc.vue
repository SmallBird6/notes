<script setup lang="ts">
import type { Heading } from '../content/render'

defineProps<{ headings: Heading[] }>()
</script>

<template>
  <aside class="toc">
    <p class="toc-title">大纲</p>
    <p v-if="headings.length === 0" class="sidebar-note">这篇没有标题</p>
    <ul v-else>
      <li v-for="heading in headings" :key="heading.slug + heading.text" :style="{ paddingLeft: `${(heading.level - 1) * 10}px` }">
        <a :href="'#' + heading.slug">{{ heading.text }}</a>
      </li>
    </ul>
  </aside>
</template>
