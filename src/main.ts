import { createApp } from 'vue'
import App from './App.vue'
import { THEME_STORAGE_KEY } from './config'
import { startNotes } from './content/catalog'
import { initReadingPrefs } from './session/reading'
import router from './router'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import './styles.css'

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
if (savedTheme === 'light' || savedTheme === 'dark') {
  document.documentElement.dataset.theme = savedTheme
}

initReadingPrefs()
startNotes()
createApp(App).use(router).mount('#app')
