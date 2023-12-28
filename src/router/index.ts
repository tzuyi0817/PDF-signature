import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
  {
    path: '/',
    name: 'index',
    component: () => import('@/pages/IndexPage.vue'),
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/pages/UploadPage.vue'),
  },
  {
    path: '/signature',
    name: 'signature',
    component: () => import('@/pages/SignaturePage.vue'),
  },
  {
    path: '/complete',
    name: 'complete',
    component: () => import('@/pages/CompletePage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
