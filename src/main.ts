import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import 'virtual:svg-icons-register';

import '@/style/index.css';
import '@/style/tailwind.css';
import App from '@/App.vue';
import router from '@/router';
import errorHandlerPlugin from '@/plugins/errorHandler';
import i18NPlugin from '@/plugins/i18n';
import idbPlugin from '@/plugins/idb';

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.use(idbPlugin);
app.use(i18NPlugin);
app.use(errorHandlerPlugin);
app.mount('#app');
