import 'devextreme/dist/css/dx.light.css';
import { createApp } from 'vue';
import '@mdi/font/css/materialdesignicons.css'
import App from '@/App.vue';
import { registerPlugins } from '@core/utils/plugins';
import * as filters from './filters';

// Styles
import '@core/scss/template/index.scss';
import '@layouts/styles/index.scss';

// Create vue app
const app = createApp(App);


// Register Global Filter
app.config.globalProperties.$filters = filters

// Register plugins
// app.use(createPinia());
registerPlugins(app);

// Mount vue app
app.mount('#app')
