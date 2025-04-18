import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Complete from '@/pages/complete/index.vue';
import Home from '@/pages/home/index.vue';
import Signature from '@/pages/signature/index.vue';
import Upload from '@/pages/upload/index.vue';

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
    component: Upload,
  },
  {
    path: '/signature',
    name: 'signature',
    component: Signature,
  },
  {
    path: '/complete',
    name: 'complete',
    component: Complete,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
