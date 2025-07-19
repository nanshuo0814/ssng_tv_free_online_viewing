<template>
  <div class="sidebar-overlay" v-if="!isCollapsed && isMobile" @click="closeSidebar"></div>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed, 'mobile': isMobile, 'mobile-visible': !isCollapsed && isMobile }">
    <div class="sidebar-header" v-if="!isCollapsed || !isMobile">
      <router-link to="/home" class="sidebar-logo">
        <img src="../assets/ssng.png" alt="Logo" class="logo-img" />
        <span class="logo-text">烁烁南光在线免费影视</span>
      </router-link>
    </div>

    <nav class="sidebar-nav">
      <!-- 内容分类 -->
      <div class="nav-section">
        <router-link to="/home" class="nav-item" :class="{ 'active': isActive('/home') }">
          <Icon name="home" :color="isActive('/home') ? 'var(--theme-color)' : '#909399'" />
          <span>首页</span>
        </router-link>
        <router-link to="/tv" class="nav-item" :class="{ 'active': isActive('/tv') }">
          <Icon name="tv" :color="isActive('/tv') ? 'var(--theme-color)' : '#909399'" />
          <span>电视剧</span>
        </router-link>
        <router-link to="/movies" class="nav-item" :class="{ 'active': isActive('/movies') }">
          <Icon name="movie" :color="isActive('/movies') ? 'var(--theme-color)' : '#909399'" />
          <span>电影</span>
        </router-link>
        <router-link to="/anime" class="nav-item" :class="{ 'active': isActive('/anime') }">
          <Icon name="anime" :color="isActive('/anime') ? 'var(--theme-color)' : '#909399'" />
          <span>动漫</span>
        </router-link>
        <router-link to="/shorts" class="nav-item" :class="{ 'active': isActive('/shorts') }">
          <Icon name="shorts" :color="isActive('/shorts') ? 'var(--theme-color)' : '#909399'" />
          <span>短剧</span>
        </router-link>
        <router-link to="/variety" class="nav-item" :class="{ 'active': isActive('/variety') }">
          <Icon name="variety" :color="isActive('/variety') ? 'var(--theme-color)' : '#909399'" />
          <span>综艺</span>
        </router-link>
        <router-link to="/external-video" class="nav-item" :class="{ 'active': isActive('/external-video') }">
          <Icon name="VideoPlay" :color="isActive('/external-video') ? 'var(--theme-color)' : '#909399'" />
          <span>凌云影视</span>
        </router-link>
        <router-link to="/soupian" class="nav-item" :class="{ 'active': isActive('/soupian') }">
          <Icon name="Reading" :color="isActive('/soupian') ? 'var(--theme-color)' : '#909399'" />
          <span>搜片.com</span>
        </router-link>
      </div>
      
      <!-- 个人中心 -->
      <div class="nav-section personal-section">
        <div class="section-title" v-if="!isCollapsed">个人中心</div>
        <router-link to="/favorites" class="nav-item" :class="{ 'active': isActive('/favorites') }">
          <Icon name="Favorite" :color="isActive('/favorites') ? 'var(--theme-color)' : '#909399'" />
          <span>我的收藏</span>
        </router-link>
        <router-link to="/history" class="nav-item" :class="{ 'active': isActive('/history') }">
          <Icon name="history" :color="isActive('/history') ? 'var(--theme-color)' : '#909399'" />
          <span>历史记录</span>
        </router-link>
        <router-link to="/activity" class="nav-item" :class="{ 'active': isActive('/activity') }">
          <Icon name="Timer" :color="isActive('/activity') ? 'var(--theme-color)' : '#909399'" />
          <span>活动记录</span>
        </router-link>
        <router-link to="/health-reminder" class="nav-item" :class="{ 'active': isActive('/health-reminder') }">
          <Icon name="Bell" :color="isActive('/health-reminder') ? 'var(--theme-color)' : '#909399'" />
          <span>健康提醒</span>
        </router-link>
        <router-link to="/message-board" class="nav-item" :class="{ 'active': isActive('/message-board') }">
          <Icon name="ChatDotRound" :color="isActive('/message-board') ? 'var(--theme-color)' : '#909399'" />
          <span>评论留言</span>
        </router-link>
      </div>

      <!-- 移动端天气和时间显示 -->
      <div class="mobile-info-section" v-if="isMobile && !isCollapsed">
        <div class="section-title">实时信息</div>
        <div class="mobile-info">
          <div class="info-item">
            <WeatherDisplay />
          </div>
          <div class="info-item">
            <TimeDisplay />
          </div>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer" :class="{ 'collapsed': isCollapsed }">
      <FpsCounter />
      <div class="footer-actions">
        <div class="collapse-toggle" @click="toggleSidebar" title="收起/展开">
          <Icon :name="isCollapsed ? 'Expand' : 'Fold'" color="var(--theme-color)" />
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
import WeatherDisplay from './WeatherDisplay.vue'
import TimeDisplay from './TimeDisplay.vue'

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
  if (path === '/home') {
    return route.path === '/home'
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

// 监听路由变化，在手机端切换路由时自动收起侧边栏
watch(() => route.path, (newPath) => {
  if (isMobile.value && !isCollapsed.value) {
    sidebarStore.collapseSidebar()
  }
})

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
}

.sidebar.mobile-visible {
  transform: translateX(0);
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
  margin-left: 5px;
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
  padding: 14px 0 0 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 16px;
}

.personal-section {
  margin-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.section-title {
  padding: 0 24px 8px 24px;
  font-size: 12px;
  color: var(--text-color-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.sidebar.collapsed .section-title {
  display: none;
}

.mobile-info-section {
  /* margin-top: 20px; */
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.mobile-info {
  padding: 8px 24px;
}

.info-item {
  margin-bottom: 8px;
}

.info-item :deep(.weather-display),
.info-item :deep(.time-display) {
  color: var(--text-color);
  font-size: 14px;
  display: flex;
  align-items: center;
}

@media (min-width: 769px) {
  .mobile-info-section {
    display: none;
  }
}

@media (max-width: 992px) {
  /* 在手机端完全隐藏侧边栏底部 */
  .sidebar-footer {
    display: none;
  }
}
</style> 