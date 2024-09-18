import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Index from '@/pages/IndexPage.vue';
import Upload from '@/pages/UploadPage.vue';
import Signature from '@/pages/SignaturePage.vue';
import Complete from '@/pages/CompletePage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
  {
    path: '/',
    name: 'index',
    component: Index,
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

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
