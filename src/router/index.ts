import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // #region Home 群組 ===
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Bdhome.vue'),
      meta: { group: 'Home' } // 💡 貼上群組標籤
    },
    // #endregion
  ]
})

export default router