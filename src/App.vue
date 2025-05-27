<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container" :class="{ 'dark-theme': isDarkTheme }">
      <Sidebar />
      <div class="main-wrapper" :class="{ 'sidebar-collapsed': isCollapsed }">
        <TopNavbar />
        <div class="main-content">
          <Suspense>
            <template #default>
              <router-view />
            </template>
            <template #fallback>
              <div class="loading-container">
                <div class="custom-loader">
                  <div class="loader-wave">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                  </div>
                  <div class="loader-text">加载中...</div>
                </div>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
      <HealthReminderOverlay />
    </div>
  </el-config-provider>
</template>

<script setup>
import { onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import TopNavbar from './components/TopNavbar.vue'
import { useThemeStore } from './stores/theme'
import { useSidebarStore } from './stores/sidebar'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useActivityStore } from './stores/activity'
import HealthReminderOverlay from './components/HealthReminderOverlay.vue'

// 配置NProgress
NProgress.configure({ 
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3
})

const router = useRouter()
const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
const activityStore = useActivityStore()
const isCollapsed = computed(() => sidebarStore.isCollapsed)
const isDarkTheme = computed(() => themeStore.theme === 'dark')

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  // 初始化侧边栏
  sidebarStore.initSidebar()
  
  // 在移动端自动折叠侧边栏
  if (window.innerWidth <= 992) {
    sidebarStore.collapseSidebar()
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 992) {
      sidebarStore.collapseSidebar()
    }
  })
  
  // 初始化活动追踪
  activityStore.initializeTracking()
  
  // 添加页面可见性变化监听
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 监听路由变化显示进度条
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach((to) => {
  NProgress.done()
  // 确保路由对象存在且有路径
  if (to && to.path) {
    // 记录页面访问
    activityStore.recordPageVisit(to.path, to.meta?.title || to.name || '未知页面')
  }
})

// 在 onBeforeUnmount 中清理
onBeforeUnmount(() => {
  // 停止活动追踪
  activityStore.stopTracking()
  
  // 移除页面可见性变化监听
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// 处理页面可见性变化
const handleVisibilityChange = () => {
  if (document.hidden) {
    // 页面隐藏时停止追踪
    activityStore.stopTracking()
  } else {
    // 页面可见时开始新的会话
    activityStore.startNewSession()
  }
}

// 添加自定义样式
const style = document.createElement('style')
style.textContent = `
  #nprogress .bar {
    background: var(--theme-color) !important;
    height: 3px !important;
  }
`
document.head.appendChild(style)
</script>

<style>
@import './assets/styles/variables.css';
@import './assets/styles/theme-colors.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow-x: hidden;
}

.app-container {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
}

.main-wrapper.sidebar-collapsed {
  margin-left: var(--sidebar-width-collapsed);
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-top: var(--topbar-height);
}

@media (max-width: 992px) {
  .main-wrapper {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
}

@media (max-width: 576px) {
  .main-content {
    padding: 10px;
  }
}

/* 通用滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dark-theme {
  --text-color: #e5eaf3;
  --text-color-light: #a3a6ad;
  --border-color: #4c4d4f;
  
  --page-background: #141414;
  --card-background: #1d1d1d;
  --button-bg: #2b2b2b;
  --button-hover-bg: #363636;
  
  --card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  --image-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  --scrollbar-thumb: #4c4d4f;
  --scrollbar-track: #1d1d1d;
}

.loading-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 新的自定义加载动画 */
.custom-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader-wave {
  display: flex;
  align-items: flex-end;
  height: 50px;
  gap: 6px;
}

.wave-bar {
  width: 8px;
  background-color: var(--theme-color, #409EFF);
  border-radius: 4px;
  animation: wave 1s ease-in-out infinite;
}

.wave-bar:nth-child(2) {
  animation-delay: 0.1s;
}

.wave-bar:nth-child(3) {
  animation-delay: 0.2s;
}

.wave-bar:nth-child(4) {
  animation-delay: 0.3s;
}

.wave-bar:nth-child(5) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0% {
    height: 10px;
  }
  50% {
    height: 40px;
  }
  100% {
    height: 10px;
  }
}

.loader-text {
  margin-top: 16px;
  font-size: 16px;
  color: var(--text-color);
}

/* Element Plus 暗色主题适配 */
.dark-theme {
  --el-bg-color: var(--card-background);
  --el-bg-color-overlay: var(--card-background);
  --el-text-color-primary: var(--text-color);
  --el-text-color-regular: var(--text-color);
  --el-border-color: var(--border-color);
  --el-border-color-light: var(--border-color);
  --el-fill-color-blank: var(--card-background);
}
</style> 