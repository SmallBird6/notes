import { createRouter, createWebHistory } from 'vue-router'

const ReadView = () => import('./views/ReadView.vue')
const EditView = () => import('./views/EditView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/edit', component: EditView },
    { path: '/edit/:pathMatch(.*)*', component: EditView },
    { path: '/', component: ReadView },
    { path: '/:pathMatch(.*)*', component: ReadView },
  ],
  scrollBehavior(to) {
    if (!to.hash) return { top: 0 }
    const id = decodeURIComponent(to.hash.slice(1))
    return new Promise((resolve) => {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' })
        resolve({ top: 72 })
      }, 0)
    })
  },
})

export default router
