import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import 'virtual:svg-icons-register';

import '@/style/index.css';
import '@/style/tailwind.css';
import App from '@/App.vue';
import router from '@/router';

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.mount('#app');
