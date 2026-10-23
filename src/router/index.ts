import { createRouter, createWebHistory } from 'vue-router'
import CHome from '../views/client/Home.vue';
import CRoom from '../views/client/Room.vue';
import CNews from '../views/client/News.vue';
import CSetting from '../views/client/Setting.vue';
import Login from '../views/Login.vue';
import Admin from '../views/admin/BDAdmin.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // "/bananaDog/"
  routes: [
    {
      path: '/Chome',
      name: 'home',
      component: CHome,
    },
    {
      path: '/Login',
      name: 'login',
      component: Login,
    },
    {
      path: '/CRoom',
      name: 'room',
      component: CRoom,
    },
    {
      path: '/CNews',
      name: 'news',
      component: CNews,
    },
    {
      path: '/CSetting',
      name: 'setting',
      component: CSetting,
    },
    {
      path: '/Admin',
      name: 'admin',
      component: Admin,
    }
  ],
})

export default router