<script setup lang="ts">
import { ref } from 'vue'
import { explainError, GitHubError } from '../github/client'
import { loginWithToken } from '../content/catalog'
import { clearToken, looksLikeFineGrained, storeToken } from '../session/token'

const emit = defineEmits<{ close: [] }>()
const value = ref('')
const error = ref('')
const busy = ref(false)

async function submit(): Promise<void> {
  const token = value.value.trim()
  error.value = ''
  if (!looksLikeFineGrained(token)) {
    error.value = '请创建细粒度令牌。粘贴的内容需要以 github_pat_ 开头，本次不会保存。'
    return
  }
  busy.value = true
  try {
    await loginWithToken(token)
    storeToken(token)
    value.value = ''
    emit('close')
  } catch (caught) {
    clearToken()
    if (caught instanceof GitHubError && caught.status === 403) {
      error.value = '这个令牌不能改文件。请把 Contents 设为 Read and write。'
    } else {
      error.value = explainError(caught)
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <form class="modal" @submit.prevent="submit">
      <h2>登录</h2>
      <p>粘贴只属于这个仓库的细粒度令牌。令牌只留在这台浏览器里，不会进入仓库、构建配置、地址栏或日志。</p>
      <p>
        创建方式：GitHub → Settings → Developer settings → Fine-grained tokens → 只选这个仓库 → Repository
        permissions 里 Contents 选 Read and write。Metadata 的只读权限会随 Contents 自动带上。设置一个到期日。
      </p>
      <label>
        细粒度令牌
        <input v-model="value" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="modal-actions">
        <button type="submit" class="primary" :disabled="busy">{{ busy ? '正在检查' : '保存令牌' }}</button>
        <button type="button" @click="emit('close')">取消</button>
      </div>
    </form>
  </div>
</template>
