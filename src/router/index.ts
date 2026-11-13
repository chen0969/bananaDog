import { createRouter, createWebHistory } from 'vue-router'
import CHome from '../views/client/VHome.vue';
import CRoom from '../views/client/VRoom.vue';
import CNews from '../views/client/VNews.vue';
import CSetting from '../views/client/VSetting.vue';
import Login from '../views/Login.vue';
import Admin from '../views/admin/VBDadmin.vue';
import SignUp from '../views/SignUp.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // "/bananaDog/"
  routes: [
    {
      path: '/',
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
    },
    {
      path: '/Signup',
      name: 'signup',
      component: SignUp,
    }
  ],
})

export default router