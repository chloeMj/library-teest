import "./assets/main.css";

import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from "quasar";
import { createPinia } from 'pinia'

import App from './App.vue'
// import router from './router'
import langKo from "quasar/lang/ko-KR";

// plugins
import util from './plugins/util'

// components
import VueVirtualScroller from 'vue-virtual-scroller'
import VueApexCharts from "vue3-apexcharts";

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'
import '@/css/app.scss'

// 클라이언트별 title, favicon 설정
const clientName = import.meta.env.VITE_CLIENT_NAME || "default";

// HTML Class 설정
document.documentElement.classList.add(`client-${clientName}`);


const app = createApp(App)

app.use(Quasar, {
  plugins: { Notify, Dialog }, // import Quasar plugins and add here
  lang: langKo,
})

app.use(createPinia())
// app.use(router)
app.use(util)
app.use(VueVirtualScroller)
app.use(VueApexCharts);

app.mount('#app')
