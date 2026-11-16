<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { articleWidth, MAX_ARTICLE_WIDTH, setArticleWidth } from '../session/reading'

let stopDrag: (() => void) | null = null

function columnOf(target: EventTarget | null): HTMLElement | null {
  return target instanceof HTMLElement ? target.parentElement : null
}

function limitOf(column: HTMLElement): number {
  return column.parentElement?.clientWidth || MAX_ARTICLE_WIDTH
}

function resizeBy(column: HTMLElement, delta: number): void {
  const rendered = column.getBoundingClientRect().width
  const base = Math.min(articleWidth.value, rendered)
  setArticleWidth(base + delta, limitOf(column))
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  const column = columnOf(event.currentTarget)
  if (!column) return
  event.preventDefault()
  resizeBy(column, event.key === 'ArrowRight' ? 24 : -24)
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) return
  const column = columnOf(event.currentTarget)
  if (!column) return
  event.preventDefault()
  const startX = event.clientX
  const startWidth = column.getBoundingClientRect().width
  const limit = limitOf(column)
  document.body.classList.add('col-resizing')
  const move = (pointer: PointerEvent) => {
    setArticleWidth(startWidth + (pointer.clientX - startX) * 2, limit)
  }
  const end = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', end)
    window.removeEventListener('pointercancel', end)
    document.body.classList.remove('col-resizing')
    stopDrag = null
  }
  stopDrag = end
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', end)
  window.addEventListener('pointercancel', end)
}

onBeforeUnmount(() => {
  stopDrag?.()
})
</script>

<template>
  <button
    class="col-resize"
    type="button"
    aria-label="调整正文列宽"
    @pointerdown="onPointerDown"
    @keydown="onKeydown"
  ></button>
</template>
