import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import 'virtual:svg-icons-register';

import '@/styles/index.css';
import App from '@/App.vue';
import { router } from '@/router';
import errorHandlerPlugin from '@/plugins/error-handler';
import i18NPlugin from '@/plugins/i18n';
import preloadPlugin from '@/plugins/preload';
import { ROUTER_INJECT_KEY } from '@/constants/router';

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.provide(ROUTER_INJECT_KEY, router.currentRoute);
app.use(i18NPlugin);
app.use(preloadPlugin);
app.use(errorHandlerPlugin);
app.mount('#app');
