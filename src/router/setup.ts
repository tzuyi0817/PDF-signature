import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Home from '@/pages/home/index.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/pages/upload/index.vue'),
  },
  {
    path: '/signature',
    name: 'signature',
    component: () => import('@/pages/signature/index.vue'),
  },
  {
    path: '/complete',
    name: 'complete',
    component: () => import('@/pages/complete/index.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
