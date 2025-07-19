<template>
  <div class="tv-nav">
    <h2 style="margin-bottom: 0px;
  padding: 15px 15px 5px;">电视剧</h2>
    <!-- 电视剧类型导航栏 -->
    <div class="tv-types">
      <div 
        v-for="type in tvTypes" 
        :key="type.id" 
        class="type-item" 
        :class="{ 'active': currentType === type.id }"
        @click="changeType(type.id)"
      >
        {{ type.name }}
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
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

    <!-- 电视剧列表 -->
    <div v-else>
      <!-- 总数显示 -->
      <div class="total-count">
        共 {{ totalTVs }} 部电视剧
      </div>
      
      <!-- 添加空状态显示 -->
      <div v-if="tvs.length === 0" class="empty-state">
        <img src="@/assets/empty-box.svg" alt="暂无数据" class="empty-icon">
        <p class="empty-text">暂无数据</p>
      </div>

      <div v-else class="tv-grid">
        <div v-for="tv in tvs" :key="tv.vod_id" class="tv-card">
          <router-link :to="`/video/detail/${tv.vod_id}`" class="tv-link">
            <div class="tv-poster">
              <img 
                :src="getImageUrl(tv.vod_pic)" 
                :alt="tv.vod_name"
                @error="handleImageError($event)"
              >
              <!-- 显示标签 -->
              <div v-if="tv.vod_remarks" class="tv-badge">
                {{ tv.vod_remarks }}
              </div>
              
              <!-- 详情悬浮层 -->
              <div class="tv-detail-overlay">
                <h4 class="detail-title">{{ tv.vod_name }}</h4>
                <div v-if="tv.vod_year" class="detail-meta">{{ tv.vod_year }}</div>
                <div v-if="tv.vod_score && tv.vod_score !== '0.0'" class="detail-score">评分: {{ tv.vod_score }}</div>
                <div v-if="tv.vod_actor" class="detail-actors">
                  {{ truncateText(tv.vod_actor, 30) }}
                </div>
                <div v-if="tv.vod_blurb || tv.vod_content" class="detail-desc">
                  {{ truncateText(tv.vod_blurb || tv.vod_content, 50) }}
                </div>
              </div>
            </div>
            <div class="tv-info">
              <h3 class="tv-title">{{ tv.vod_name }}</h3>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 加载更多提示 -->
      <div v-if="loadingMore" class="loading-more">
        <div class="loading-spinner">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在加载更多...</span>
        </div>
      </div>
    </div>
    <!-- 添加回到顶部组件 -->
    <BackToTop />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import axios from 'axios'
import { useThemeStore } from '../stores/theme'
import BackToTop from '@/components/BackToTop.vue'

// 获取主题状态
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.theme === 'dark')

// 电视剧类型列表
const tvTypes = [
  { id: 13, name: '国产剧' },
  { id: 14, name: '港台剧' },
  { id: 15, name: '日韩剧' },
  { id: 16, name: '欧美剧' },
  { id: 27, name: '泰国剧' },
  { id: 28, name: '海外剧' }
]

// 状态变量
const loading = ref(true)
const tvs = ref([])
const currentPage = ref(1)
const pageSize = ref(24)
const totalTVs = ref(0)
const currentType = ref(13) // 默认国产剧

// 添加是否正在加载更多的标志
const loadingMore = ref(false)
const hasMore = ref(true)

// 监听滚动事件
const handleScroll = async () => {
  // 如果正在加载或没有更多数据，则不处理
  if (loadingMore.value || !hasMore.value) return
  
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight
  
  // 当滚动到距离底部100px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 100) {
    currentPage.value++
    loadingMore.value = true
    try {
      await fetchTVs(true) // 传入true表示是加载更多
    } finally {
      loadingMore.value = false
    }
  }
}

// 修改加载电视剧数据的方法
const fetchTVs = async (isLoadMore = false) => {
  try {
    if (!isLoadMore) {
      loading.value = true
      tvs.value = []
    }
    
    const typeId = currentType.value
    
    console.log(`正在加载类型ID: ${typeId} 的数据，页码: ${currentPage.value}`)
    try {
      const response = await axios.get(`/api/api.php/provide/vod/`, {
        params: {
          ac: 'videolist',
          pg: currentPage.value,
          pagesize: pageSize.value,
          t: typeId
        }
      })
      
      if (response.data && response.data.code === 1) {
        if (response.data.list && response.data.list.length > 0) {
          if (isLoadMore) {
            tvs.value = [...tvs.value, ...response.data.list]
          } else {
            tvs.value = response.data.list
          }
          totalTVs.value = parseInt(response.data.total) || 0
          hasMore.value = tvs.value.length < totalTVs.value
        } else {
          if (!isLoadMore) {
            tvs.value = []
            totalTVs.value = 0
          }
          hasMore.value = false
        }
      } else {
        console.error('API返回错误或数据为空:', response.data)
        if (!isLoadMore) {
          tvs.value = []
          totalTVs.value = 0
        }
        hasMore.value = false
        ElMessage.error('获取数据失败')
      }
    } catch (error) {
      console.error('API请求出错:', error)
      if (!isLoadMore) {
        tvs.value = []
        totalTVs.value = 0
      }
      hasMore.value = false
      ElMessage.error('网络请求失败，请稍后重试')
    }
  } catch (error) {
    console.error('获取数据出错:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// 切换电视剧类型时重置状态
const changeType = (typeId) => {
  currentType.value = typeId
  currentPage.value = 1
  hasMore.value = true
  window.scrollTo(0, 0)
  fetchTVs()
}

// 处理图片URL
const getImageUrl = (url) => {
  if (!url) {
    return '/src/assets/default-poster.svg'
  }
  
  // 检查URL是否有效
  if (url.includes('null') || url === 'undefined' || url === '') {
    return '/src/assets/default-poster.svg'
  }
  
  // 有些API返回的图片可能带有http，确保使用https
  if (url.startsWith('http:')) {
    return url.replace('http:', 'https:')
  }
  
  return url
}

// 处理图片加载失败
const handleImageError = (event) => {
  event.target.src = '/src/assets/default-poster.svg'
}

// 文本截断函数
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// 组件挂载时添加滚动监听
onMounted(() => {
  fetchTVs()
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.tv-nav {
  padding: 0 0 20px;
  background-color: var(--card-background);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

/* 电视剧类型导航栏 */
.tv-types {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  /* margin-bottom: 15px; */
  overflow-x: auto;
}

.type-item {
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s;
  background-color: var(--hover-background);
  color: var(--text-color);
  white-space: nowrap;
}

.type-item:hover {
  background-color: rgba(0, 150, 136, 0.1);
}

.type-item.active {
  background-color: #009688; /* 青色背景 */
  color: white;
}

/* 加载状态 */
.loading-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 自定义加载动画 */
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

/* 电视剧网格 */
.tv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 0 15px;
}

.tv-card {
  background: transparent;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.tv-card:hover {
  transform: translateY(-5px);
}

.tv-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.tv-poster {
  position: relative;
  height: 250px;
  overflow: hidden;
  border-radius: 6px;
  background-color: var(--hover-background);
}

.tv-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.tv-card:hover .tv-poster img {
  transform: scale(1.05);
}

/* 标签 */
.tv-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 3px 8px;
  border-radius: 2px;
  font-size: 12px;
  z-index: 1;
}

/* 详情悬浮层 */
.tv-detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  text-align: left;
}

.tv-card:hover .tv-detail-overlay {
  opacity: 1;
}

.detail-title {
  font-size: 16px;
  margin: 0 0 8px;
  font-weight: bold;
}

.detail-meta,
.detail-score,
.detail-actors,
.detail-desc {
  font-size: 12px;
  margin-bottom: 5px;
  opacity: 0.9;
}

.detail-score {
  color: #ff9900;
}

.tv-info {
  padding: 10px 0;
}

.tv-title {
  margin: 0;
  font-size: 15px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* 移除分页相关样式 */
.total-count {
  text-align: center;
  color: var(--text-color);
  margin: 0 0 10px 0;
  font-size: 14px;
}

/* 加载更多样式优化 */
.loading-more {
  padding: 20px;
  text-align: center;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 14px;
}

.loading-spinner .el-icon {
  font-size: 20px;
  color: var(--text-color);
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 移除旧的分页样式 */
.pagination-container,
:deep(.pagination-dark) {
  display: none;
}

@media (max-width: 768px) {
  .tv-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .tv-poster {
    height: 220px;
  }
  
  .type-item {
    padding: 6px 15px;
    font-size: 14px;
  }
}

/* 添加空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: var(--text-color);
  font-size: 14px;
  opacity: 0.7;
  margin: 0;
}
</style> 