# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


# 1. install Quasar
```
npm install quasar @quasar/extras
npm install -D @quasar/vite-plugin sass-embedded@^1.93.2
```
# 2. set Quasar on main.ts
```
import { Quasar, Notify } from 'quasar'
import './style.css
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

const app = createApp(App)
app.use(Quasar, {
    config: {
        dark: false
    },
    plugins: { // import Quasar plugins and add here
        Notify
    },
})
app.mount('#app')
```

# 3.install library 
```
npm i https://github.com/chloeMj/library-teest.git
```
# 4. set library on main.ts
```
import LibraryTest from 'library-test'
app.use(LibraryTest)
```
