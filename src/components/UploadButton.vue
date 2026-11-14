<script setup lang="ts">
import { ref } from 'vue'
import { contentDir, MAX_FILE_BYTES } from '../config'
import { notes, uploadFile } from '../content/catalog'
import { explainError } from '../github/client'
import { isWritablePath, parentDir } from '../github/paths'

const message = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const dirInput = ref<HTMLInputElement | null>(null)

function targetPath(file: File, folder: boolean): string {
  if (folder && file.webkitRelativePath) return `${contentDir}/${file.webkitRelativePath}`.normalize('NFC')
  const dir = notes.currentPath ? parentDir(notes.currentPath) : contentDir
  return `${dir}/${file.name}`.normalize('NFC')
}

async function consume(files: FileList | null, folder: boolean): Promise<void> {
  message.value = ''
  if (!files || files.length === 0) return
  const accepted: { file: File; path: string }[] = []
  const skipped: string[] = []
  for (const file of Array.from(files)) {
    const path = targetPath(file, folder)
    if (file.size > MAX_FILE_BYTES) {
      skipped.push(`${path} 超过 1 MB`)
      continue
    }
    if (!isWritablePath(path)) {
      skipped.push(`${path} 不是可写入的 Markdown 或图片`)
      continue
    }
    accepted.push({ file, path })
  }
  const existing = accepted.filter((item) => notes.entries.some((entry) => entry.path === item.path))
  if (existing.length > 0) {
    const confirmed = window.confirm(`以下文件已存在，确认后按更新写入：\n${existing.map((item) => item.path).join('\n')}`)
    if (!confirmed) {
      message.value = '已取消上传'
      return
    }
  }
  const done: string[] = []
  for (const item of accepted) {
    try {
      await uploadFile(item.path, item.file)
      done.push(item.path)
    } catch (error) {
      const reason = explainError(error)
      message.value = [`${item.path} 上传失败：${reason}`, done.length ? `已保留：${done.join('、')}` : '', ...skipped]
        .filter(Boolean)
        .join('\n')
      return
    }
  }
  const parts = [`已上传 ${done.length} 个文件`]
  if (skipped.length) parts.push(skipped.join('；'))
  message.value = parts.join('\n')
}

function clearInput(input: HTMLInputElement | null): void {
  if (input) input.value = ''
}
</script>

<template>
  <span class="upload">
    <button type="button" @click="fileInput?.click()">上传文件</button>
    <button type="button" @click="dirInput?.click()">上传文件夹</button>
    <input
      ref="fileInput"
      class="hidden-input"
      type="file"
      multiple
      accept=".md,.png,.jpg,.jpeg,.gif,.webp,text/markdown,image/png,image/jpeg,image/gif,image/webp"
      @change="consume(($event.target as HTMLInputElement).files, false).finally(() => clearInput(fileInput))"
    />
    <input
      ref="dirInput"
      class="hidden-input"
      type="file"
      multiple
      webkitdirectory
      @change="consume(($event.target as HTMLInputElement).files, true).finally(() => clearInput(dirInput))"
    />
    <p v-if="message" class="upload-message">{{ message }}</p>
  </span>
</template>
