<template>
  <div class="top-navbar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="navbar-container">
      <div class="search-box">
        <Icon name="search" color="#909399" class="search-icon" />
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="搜索电影、电视剧..."
          class="search-input"
        />
      </div>
      
      <div class="navbar-actions">
        <router-link to="/history" class="nav-action" :class="{ 'active': isActive('/history') }" title="观看历史">
          <Icon name="history" :color="isActive('/history') ? '#2196f3' : '#909399'" />
          <span class="action-text">历史记录</span>
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
import { ref, computed } from 'vue'
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

function isActive(path) {
  return route.path.includes(path)
}
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

.search-box {
  position: relative;
  flex: 0 1 500px;
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
  gap: 16px;
}

.nav-action {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-action .el-icon {
  margin-right: 6px;
}

.nav-action:hover {
  background-color: var(--hover-background);
  color: var(--primary-color);
}

.nav-action.active {
  color: var(--primary-color);
  background-color: var(--hover-background);
}

.action-text {
  font-size: 14px;
  line-height: 1;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 992px) {
  .top-navbar {
    left: var(--sidebar-width-collapsed);
  }
  
  .action-text {
    display: none;
  }
  
  .nav-action .el-icon {
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .search-box {
    flex: 0 1 300px;
  }
}

@media (max-width: 576px) {
  .search-box {
    flex: 0 1 200px;
  }
}
</style> 