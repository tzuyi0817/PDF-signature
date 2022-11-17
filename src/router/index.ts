import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
  {
    path: '/',
    name: 'index',
    component: () => import('@/pages/Index.vue')
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/pages/Upload.vue')
  },
  {
    path: '/signature',
    name: 'signature',
    component: () => import('@/pages/Signature.vue')
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;