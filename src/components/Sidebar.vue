<template>
  <div class="sidebar-overlay" v-if="!isCollapsed && isMobile" @click="closeSidebar"></div>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed, 'mobile': isMobile, 'mobile-open': isMobile && !isCollapsed }">
    <div class="sidebar-header">
      <router-link to="/" class="sidebar-logo">
        <img src="../assets/ssng.png" alt="Logo" class="logo-img" />
        <span class="logo-text">烁烁南光在线免费影视</span>
      </router-link>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" :class="{ 'active': isActive('/') }">
        <Icon name="home" :color="isActive('/') ? '#4caf50' : '#909399'" />
        <span>首页</span>
      </router-link>
      <router-link to="/tv" class="nav-item" :class="{ 'active': isActive('/tv') }">
        <Icon name="tv" :color="isActive('/tv') ? '#2196f3' : '#909399'" />
        <span>电视剧</span>
      </router-link>
      <router-link to="/movies" class="nav-item" :class="{ 'active': isActive('/movies') }">
        <Icon name="movie" :color="isActive('/movies') ? '#e91e63' : '#909399'" />
        <span>电影</span>
      </router-link>
      <router-link to="/anime" class="nav-item" :class="{ 'active': isActive('/anime') }">
        <Icon name="anime" :color="isActive('/anime') ? '#9c27b0' : '#909399'" />
        <span>动漫</span>
      </router-link>
      <router-link to="/shorts" class="nav-item" :class="{ 'active': isActive('/shorts') }">
        <Icon name="shorts" :color="isActive('/shorts') ? '#ff9800' : '#909399'" />
        <span>短剧</span>
      </router-link>
      <router-link to="/variety" class="nav-item" :class="{ 'active': isActive('/variety') }">
        <Icon name="variety" :color="isActive('/variety') ? '#673ab7' : '#909399'" />
        <span>综艺</span>
      </router-link>
      <router-link to="/history" class="nav-item nav-item-mobile" :class="{ 'active': isActive('/history') }">
        <Icon name="history" :color="isActive('/history') ? '#2196f3' : '#909399'" />
        <span>历史记录</span>
      </router-link>
    </nav>

    <div class="sidebar-footer" :class="{ 'collapsed': isCollapsed }">
      <FpsCounter />
      <div class="footer-actions">
        <div class="collapse-toggle" @click="toggleSidebar" title="收起/展开">
          <Icon :name="isCollapsed ? 'Expand' : 'Fold'" color="#606266" />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref, onBeforeMount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useSidebarStore } from '../stores/sidebar'
import Icon from './Icon.vue'
import FpsCounter from './FpsCounter.vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()

const isDarkTheme = computed(() => themeStore.theme === 'dark')
const isCollapsed = computed(() => sidebarStore.isCollapsed)
const showFps = computed(() => sidebarStore.showFps)
const isMobile = ref(false)

function toggleSidebar() {
  sidebarStore.toggleCollapse()
}

function closeSidebar() {
  if (isMobile.value && !isCollapsed.value) {
    sidebarStore.collapseSidebar()
  }
}

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.includes(path)
}

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  // 在移动设备上默认收起侧边栏
  if (isMobile.value) {
    sidebarStore.collapseSidebar()
  }
}

watch(isMobile, (newValue) => {
  if (newValue) {
    sidebarStore.collapseSidebar()
  }
})

onBeforeMount(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onMounted(() => {
  // 初始化侧边栏状态
  sidebarStore.initSidebar()
  
  // 如果当前路径为根路径，初始化时自动导航到首页
  if (route.path === '/') {
    router.push('/')
  }
})
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: var(--background-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar.mobile {
  transform: translateX(-100%);
  width: 240px;
}

.sidebar.mobile-open {
  transform: translateX(0);
}

.sidebar.mobile.collapsed {
  width: 0;
  transform: translateX(0);
  border-right: none;
  box-shadow: none;
}

.sidebar-header {
  padding: 16px;
  height: 64px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .logo-text {
  opacity: 0;
  width: 0;
  margin-left: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: var(--text-color);
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item .el-icon {
  margin-right: 12px;
  transition: margin 0.3s ease;
}

.nav-item span {
  line-height: 1;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-item span {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.nav-item:hover {
  background-color: var(--hover-background);
  color: var(--primary-color);
}

.nav-item.active {
  color: var(--primary-color);
  background-color: var(--hover-background);
  border-left-color: var(--primary-color);
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.sidebar-footer.collapsed {
  padding: 16px 8px;
  justify-content: space-between;
}

.footer-actions {
  display: flex;
  align-items: center;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  margin-left: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.collapse-toggle:hover {
  background-color: var(--hover-background);
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.sidebar.collapsed .nav-item .el-icon {
  margin-right: 0;
}

.nav-item-mobile {
  display: none;
}

@media (max-width: 768px) {
  .sidebar.mobile.collapsed {
    width: 0;
  }
  
  .nav-item-mobile {
    display: flex;
  }
  
  .sidebar-footer {
    display: none;
  }
}
</style> 