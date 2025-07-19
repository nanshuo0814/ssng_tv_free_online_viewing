import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/variables.css'

// 导入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建Vue应用实例
const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app') 