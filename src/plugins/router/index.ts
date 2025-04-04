import type { App } from 'vue'
import router from './routes'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes,
// })

export default function (app: App) {
  app.use(router)
}

export { router }
