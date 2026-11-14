import { ref } from 'vue'

export const tokenDialogOpen = ref(false)
export const sidebarOpen = ref(false)

export function requestLogin(): void {
  tokenDialogOpen.value = true
}
