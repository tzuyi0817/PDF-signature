import { createApp } from 'vue';
import App from '@/App.vue';
import errorHandlerPlugin from '@/plugins/error-handler';
import i18NPlugin from '@/plugins/i18n';
import preloadPlugin from '@/plugins/preload';
import router from '@/router';
import { createPinia } from './stores';
import 'virtual:svg-icons-register';
import '@/styles/index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18NPlugin);
app.use(preloadPlugin);
app.use(errorHandlerPlugin);
app.mount('#app');
