<template>
  <div class="top-navbar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="navbar-container">
      <div class="left-section">
        <router-link to="/" class="navbar-logo" v-if="isMobileAndCollapsed">
          <img src="../assets/ssng.png" alt="Logo" class="logo-img" />
        </router-link>
        <div class="toggle-icon" @click="toggleSidebar" title="展开/收起侧边栏">
          <Icon :name="isCollapsed ? 'Expand' : 'Fold'" color="#606266" />
        </div>
      </div>
      
      <div class="search-box">
        <Icon name="search" color="#909399" class="search-icon" />
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="搜索电影、电视剧、动漫、短剧、综艺..."
          class="search-input"
        />
      </div>
      
      <div class="navbar-actions">
        <router-link to="/history" class="nav-action" :class="{ 'active': isActive('/history') }" title="观看历史">
          <Icon name="history" :color="isActive('/history') ? '#2196f3' : '#909399'" />
        </router-link>
        
        <div class="nav-action theme-toggle" @click="toggleTheme" title="切换主题">
          <Icon v-if="!isDarkTheme" name="dark" color="#3f51b5" />
          <Icon v-else name="light" color="#ff9800" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useSidebarStore } from '../stores/sidebar'
import Icon from './Icon.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()

const searchQuery = ref('')
const isDarkTheme = computed(() => themeStore.theme === 'dark')
const isCollapsed = computed(() => sidebarStore.isCollapsed)
const isMobile = ref(false)

// 只在移动模式且侧边栏折叠时显示logo
const isMobileAndCollapsed = computed(() => {
  return isMobile.value && isCollapsed.value
})

function checkMobile() {
  isMobile.value = window.innerWidth <= 992
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value }
    })
    searchQuery.value = ''
  }
}

function toggleTheme() {
  themeStore.toggleTheme()
}

function toggleSidebar() {
  sidebarStore.toggleCollapse()
}

function isActive(path) {
  return route.path.includes(path)
}

onBeforeMount(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onMounted(() => {
  checkMobile()
})
</script>

<style scoped>
.top-navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-width);
  height: var(--topbar-height);
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  z-index: 5;
  transition: left 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.top-navbar.sidebar-collapsed {
  left: var(--sidebar-width-collapsed);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.left-section {
  display: flex;
  align-items: center;
  min-width: 40px;
}

.navbar-logo {
  display: none; /* 默认在PC端隐藏 */
}

.logo-img {
  height: 28px;
  width: auto;
}

.toggle-icon {
  display: none; /* 默认在PC端隐藏 */
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  margin-right: 16px;
}

.toggle-icon:hover {
  background-color: var(--hover-background);
}

.search-box {
  position: relative;
  flex: 0 1 550px;
  margin-left: 10px;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background-color: var(--search-background);
  color: var(--text-color);
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.search-box .search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0px; /* 移除PC端历史记录和暗黑模式图标间的间距 */
}

.nav-action {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-color);
  text-decoration: none;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-action:hover {
  background-color: var(--hover-background);
  color: var(--primary-color);
}

.nav-action.active {
  color: var(--primary-color);
  background-color: var(--hover-background);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 992px) {
  .navbar-logo {
    display: flex; /* 在移动端显示logo */
    align-items: center;
    margin-right: 0px;
  }
  
  /* 放大移动端logo */
  .logo-img {
    height: 32px;
    width: auto;
  }
  
  /* 侧边栏展开时隐藏顶部logo */
  .top-navbar:not(.sidebar-collapsed) .navbar-logo {
    display: none;
  }
  
  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0; /* 移除伸缩图标和搜索框之间的间距 */
    /* 放大伸缩图标 */
    padding: 10px;
  }
  
  .top-navbar {
    left: 0;
  }
  
  .search-box {
    margin-left: 0;
    flex: 1;
  }
  
  .navbar-actions {
    gap: 2px; /* 减少历史记录和主题切换图标间距 */
  }
  
  .nav-action {
    padding: 6px;
  }
}

@media (max-width: 768px) {
  .search-box {
    flex: 1;
  }
  
  .navbar-container {
    padding: 0 10px;
  }
}

@media (max-width: 576px) {
  /* 小屏幕上更进一步放大logo和图标 */
  .logo-img {
    height: 30px;
  }
  
  .toggle-icon {
    margin-right: 0; /* 确保小屏幕上也没有间距 */
    padding: 8px;
  }
  
  .navbar-container {
    padding: 0 8px;
  }
  
  .navbar-actions {
    gap: 0px; /* 完全移除间距 */
  }
  
  .search-input {
    padding: 8px 12px 8px 36px; /* 缩小搜索框内边距 */
    font-size: 13px;
  }
  
  .search-box .search-icon {
    left: 12px;
  }
}

@media (max-width: 480px) {
  /* 更进一步调整极小屏幕 */
  .logo-img {
    height: 28px;
  }
  
  .toggle-icon {
    margin-right: 0;
    padding: 6px;
  }
  
  .navbar-container {
    padding: 0 6px;
  }
  
  .nav-action {
    padding: 5px;
  }
}
</style> 