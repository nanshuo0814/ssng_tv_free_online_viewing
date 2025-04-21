<template>
  <div class="app-container">
    <Sidebar />
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': isCollapsed }">
      <TopNavbar />
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import TopNavbar from './components/TopNavbar.vue'
import { useThemeStore } from './stores/theme'
import { useSidebarStore } from './stores/sidebar'

const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
const isCollapsed = computed(() => sidebarStore.isCollapsed)

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
})
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
</style> 