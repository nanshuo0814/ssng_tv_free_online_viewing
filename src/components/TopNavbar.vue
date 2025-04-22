<template>
  <div class="top-navbar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="navbar-container">
      <div class="left-section">
        <router-link to="/" class="navbar-logo" v-if="isMobileAndCollapsed">
          <img src="../assets/ssng.png" alt="Logo" class="logo-img" />
        </router-link>
        <div class="toggle-icon" @click="toggleSidebar" title="展开/收起侧边栏">
          <Icon :name="isCollapsed ? 'Expand' : 'Fold'" color="var(--text-color)" />
        </div>
        
        <!-- PC端时间显示放在左边 -->
        <TimeDisplay class="pc-only" />
        
        <!-- PC端天气显示放在时间右边 -->
        <WeatherDisplay class="pc-only" />
      </div>
      
      <div class="search-box">
        <Icon name="search" color="var(--text-color-light)" class="search-icon" />
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          @focus="showDropdown = true"
          @blur="handleBlur"
          type="text"
          placeholder="搜索电影、电视剧、动漫、短剧、综艺..."
          class="search-input"
        />
        
        <!-- 搜索历史下拉列表 -->
        <div 
          v-show="showDropdown && searchHistoryStore.history.length > 0" 
          class="search-history-dropdown"
          @mousedown.prevent
        >
          <div class="dropdown-header">
            <span>搜索历史</span>
            <el-button 
              link 
              size="small" 
              @click.stop="clearHistory"
            >
              清空历史
            </el-button>
          </div>
          <div class="history-list">
            <div 
              v-for="(item, index) in searchHistoryStore.history" 
              :key="index"
              class="history-item"
              @mousedown.prevent="searchTag(item)"
            >
              <span class="history-text">{{ item }}</span>
              <el-icon 
                class="delete-icon"
                @mousedown.prevent.stop="removeHistory(item)"
              >
                <Close />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
      
      <div class="navbar-actions">
        <!-- 添加全屏图标，添加pc-only类 -->
        <div class="nav-action pc-only" @click="toggleFullScreen" title="全屏/退出全屏">
          <Icon :name="isFullScreen ? 'ExitFullScreen' : 'FullScreen'" :color="isFullScreen ? 'var(--theme-color)' : 'var(--text-color)'" />
        </div>
        
        <!-- 添加主题色选择器 -->
        <ThemeColorPicker class="nav-action" />
        
        <div class="nav-action theme-toggle" @click="toggleTheme" title="切换主题">
          <Icon v-if="!isDarkTheme" name="dark" :color="'var(--theme-color)'" />
          <Icon v-else name="light" :color="'var(--theme-color)'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useSidebarStore } from '../stores/sidebar'
import { useSearchHistoryStore } from '../stores/searchHistory'
import Icon from './Icon.vue'
import WeatherDisplay from './WeatherDisplay.vue'
import TimeDisplay from './TimeDisplay.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
const searchHistoryStore = useSearchHistoryStore()

const searchQuery = ref('')
const isDarkTheme = computed(() => themeStore.theme === 'dark')
const isCollapsed = computed(() => sidebarStore.isCollapsed)
const isMobile = ref(false)
const isFullScreen = ref(false)
const showDropdown = ref(false)

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
    searchHistoryStore.addHistory(searchQuery.value.trim())
    searchQuery.value = ''
    showDropdown.value = false
  }
}

function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

function searchTag(keyword) {
  router.push({
    path: '/search',
    query: { q: keyword }
  })
  searchQuery.value = ''
  showDropdown.value = false
}

function removeHistory(keyword, event) {
  if (event) event.stopPropagation()
  searchHistoryStore.removeHistory(keyword)
}

function clearHistory() {
  ElMessageBox.confirm(
    '确定要清空所有搜索历史吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    searchHistoryStore.clearHistory()
    ElMessage.success('已清空搜索历史')
  }).catch(() => {})
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

// 切换全屏状态
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullScreen.value = true
    }).catch(err => {
      console.error(`全屏请求出错: ${err.message}`)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullScreen.value = false
      }).catch(err => {
        console.error(`退出全屏出错: ${err.message}`)
      })
    }
  }
}

// 监听全屏变化
function handleFullScreenChange() {
  isFullScreen.value = !!document.fullscreenElement
}

onBeforeMount(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onMounted(() => {
  checkMobile()
  // 添加全屏变化监听器
  document.addEventListener('fullscreenchange', handleFullScreenChange)
})

onUnmounted(() => {
  // 清理全屏变化监听器
  document.removeEventListener('fullscreenchange', handleFullScreenChange)
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
  padding: 0 8px; /* 添加少量水平内边距 */
  gap: 5px; /* 组件之间添加少量间距 */
}

.left-section {
  display: flex;
  align-items: center;
  padding-left: 13px;
  margin: 0;
  gap: 5px; /* 添加左侧组件间的间距 */
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
  margin-right: 0;
}

.toggle-icon:hover {
  background-color: var(--hover-background);
}

.pc-only {
  display: flex; /* PC端显示 */
  margin: 0;
  padding: 0;
}

.search-box {
  position: relative;
  flex: 1 1 auto;
  margin: 0 5px;
  max-width: 550px;
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
  gap: 0px;
  margin: 0;
  padding: 0;
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
  margin: 0;
}

.nav-action:hover {
  background-color: var(--hover-background);
  color: var(--theme-color);
}

.nav-action.active {
  color: var(--theme-color);
  background-color: var(--hover-background);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: var(--text-color);
}

.history-item:hover {
  background-color: var(--theme-color-10);
}

.history-text {
  flex: 1;
}

.delete-icon {
  opacity: 0.6;
  transition: opacity 0.3s ease;
  font-size: 14px;
}

.delete-icon:hover {
  opacity: 1;
}

@media (max-width: 1200px) {
  .search-box {
    max-width: 400px; /* 较窄屏幕上减小搜索框最大宽度 */
  }
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
  
  .pc-only {
    display: none; /* 移动端隐藏 */
  }
  
  .search-box {
    margin-left: 0;
    flex: 1;
    max-width: none; /* 移动端取消最大宽度限制 */
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