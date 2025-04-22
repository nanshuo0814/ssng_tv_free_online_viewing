<template>
  <!-- <div class="tv"> -->
    <div class="tv-header">
      <h2 style="">电视剧</h2>
      
      <!-- 电视剧分类选项卡 -->
      <div v-if="currentType === 'tv'" class="drama-type-tabs">
        <div 
          v-for="type in dramaTypes" 
          :key="type.value" 
          class="drama-tab" 
          :class="{ 'active': dramaType === type.value }"
          @click="selectDramaType(type.value)"
        >
          {{ type.label }}
        </div>
      </div>
      </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated :theme="isDarkTheme ? 'dark' : 'light'" />
    </div>

    <!-- 电影/剧集网格 -->
    <div v-else>
      <!-- 总数显示 -->
      <div class="total-count">
        共 {{ totalMovies }} 部电视剧
      </div>
      
      <!-- 添加空状态显示 -->
      <div v-if="movies.length === 0" class="empty-state">
        <img src="@/assets/empty-box.svg" alt="暂无数据" class="empty-icon">
        <p class="empty-text">暂无数据</p>
      </div>

      <div v-else class="movie-grid">
        <div v-for="movie in displayMovies" :key="movie.vod_id" class="movie-card">
          <router-link :to="`/video/detail/${movie.vod_id}`" class="movie-link">
          <div class="movie-poster">
              <img 
                :src="getImageUrl(movie.vod_pic)" 
                :alt="movie.vod_name"
                @error="handleImageError($event)"
              >
              <!-- 显示集数标签 -->
              <div v-if="movie.vod_remarks" class="episode-badge">
                {{ movie.vod_remarks }}
              </div>
              
              <!-- 新增：影片详情悬浮层 -->
              <div class="movie-detail-overlay">
                <h4 class="detail-title">{{ movie.vod_name }}</h4>
                <div v-if="movie.vod_year" class="detail-meta">{{ movie.vod_year }}</div>
                <div v-if="movie.vod_score" class="detail-score">评分: {{ movie.vod_score }}</div>
                <div v-if="movie.vod_actor" class="detail-actors">
                  {{ truncateText(movie.vod_actor, 30) }}
                </div>
                <div v-if="movie.vod_content" class="detail-desc">
                  {{ truncateText(movie.vod_content, 50) }}
                </div>
              </div>
          </div>
          <div class="movie-info">
              <h3 class="movie-title">{{ movie.vod_name }}</h3>
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
  <!-- </div> -->
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { useThemeStore } from '../stores/theme'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, VideoPlay, Loading } from '@element-plus/icons-vue'
import axios from 'axios'

// 获取主题状态
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.theme === 'dark')

const props = defineProps({
  type: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const router = useRouter()
const favoriteStore = useFavoriteStore()

// 状态变量
const loading = ref(true)
const movies = ref([])
const currentPage = ref(1)
const pageSize = ref(24)
const totalMovies = ref(0)
// 恢复筛选条件变量
const filterOrder = ref('popular')
const filterYear = ref('all')

// 电视剧分类
const dramaType = ref('国产剧')
const dramaTypes = [
  { label: '国产剧', value: '国产剧', typeId: 13 },
  { label: '港剧', value: '港剧', typeId: 14 },
  { label: '韩剧', value: '韩剧', typeId: 15 },
  { label: '日剧', value: '日剧', typeId: 16 },
  { label: '泰剧', value: '泰剧', typeId: 28 },
  { label: '台剧', value: '台剧', typeId: 29 },
  { label: '欧美剧', value: '欧美剧', typeId: 30 },
  { label: '新马剧', value: '新马剧', typeId: 31 },
  { label: '其他剧', value: '其他剧', typeId: 32 }
]

// 获取当前分类类型
const currentType = computed(() => props.type || route.params.type)

// 计算分类标题
const categoryTitle = computed(() => {
  const typeMap = {
    movie: '电影',
    tv: '电视剧',
    anime: '动漫',
    variety: '综艺',
    shorts: '短剧'
  }
  return typeMap[currentType.value] || '未知分类'
})

// 获取当前分类的API类型ID
const currentTypeId = computed(() => {
  if (currentType.value === 'tv') {
    // 根据选择的剧集类型返回对应的typeId
    const selectedType = dramaTypes.find(type => type.value === dramaType.value)
    return selectedType ? selectedType.typeId : 13 // 默认国产剧
  } else if (currentType.value === 'movie') {
    return 1 // 电影
  } else if (currentType.value === 'anime') {
    return 4 // 动漫
  } else if (currentType.value === 'variety') {
    return 3 // 综艺
  } else if (currentType.value === 'shorts') {
    return 22 // 短剧
  }
  return 0
})

// 显示的电影列表
const displayMovies = computed(() => {
  let result = [...movies.value]
  
  // 年代筛选
  if (filterYear.value !== 'all') {
    result = result.filter(movie => {
      // 从movie.vod_year获取年份
      const year = movie.vod_year ? parseInt(movie.vod_year) : 0
      
    if (filterYear.value === '2010s') {
        return year >= 2010 && year < 2020
    } else if (filterYear.value === '2000s') {
        return year >= 2000 && year < 2010
    } else if (filterYear.value === 'earlier') {
        return year < 2000
    } else {
        return movie.vod_year === filterYear.value
    }
    })
  }
  
  // 排序
  if (filterOrder.value === 'rating') {
    result.sort((a, b) => parseFloat(b.vod_score || 0) - parseFloat(a.vod_score || 0))
  } else if (filterOrder.value === 'newest') {
    result.sort((a, b) => {
      const dateA = a.vod_time ? new Date(a.vod_time) : new Date(0)
      const dateB = b.vod_time ? new Date(b.vod_time) : new Date(0)
      return dateB - dateA
    })
  }
  
  return result
})

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
    await fetchMovies(true) // 传入true表示是加载更多
    loadingMore.value = false
  }
}

// 修改加载电视剧数据的方法
const fetchMovies = async (isLoadMore = false) => {
  try {
    if (!isLoadMore) {
      loading.value = true
      movies.value = []
    }
    
    const typeId = currentTypeId.value
    
    if (!typeId) {
      movies.value = []
      totalMovies.value = 0
      loading.value = false
      return
    }
    
    console.log(`正在加载类型ID: ${typeId} 的数据，页码: ${currentPage.value}`)
    
    const response = await axios.get(`/api/api.php/provide/vod/`, {
      params: {
        ac: 'videolist',
        pg: currentPage.value,
        t: typeId,
        pagesize: pageSize.value,
      }
    })
    
    if (response.data && response.data.code === 1) {
      if (response.data.list && response.data.list.length > 0) {
        if (isLoadMore) {
          movies.value = [...movies.value, ...response.data.list]
        } else {
          movies.value = response.data.list
        }
        totalMovies.value = parseInt(response.data.total) || 0
        hasMore.value = movies.value.length < totalMovies.value
      } else {
        hasMore.value = false
        if (!isLoadMore) {
          movies.value = []
          totalMovies.value = 0
        }
      }
    } else {
      throw new Error('API返回数据格式错误')
    }
  } catch (error) {
    console.error('获取电视剧数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    if (!isLoadMore) {
      movies.value = []
      totalMovies.value = 0
    }
    hasMore.value = false
  } finally {
    if (!isLoadMore) {
      loading.value = false
    }
  }
}

// 切换剧集类型时重置状态
const selectDramaType = (type) => {
  dramaType.value = type
  currentPage.value = 1
  hasMore.value = true
  window.scrollTo(0, 0)
  fetchMovies()
}

// 播放电影/剧集
const playMovie = (movie) => {
  router.push(`/play/${currentType.value}/${movie.vod_id}`)
  ElMessage.success(`正在播放: ${movie.vod_name}`)
}

// 添加到收藏
const addToFavorite = (movie) => {
  favoriteStore.addFavorite({
    id: movie.vod_id.toString(),
    title: movie.vod_name,
    url: `/play/${currentType.value}/${movie.vod_id}`,
    site: 'SSNG TV',
    type: currentType.value,
    poster: movie.vod_pic
  })
  ElMessage.success('已添加到收藏')
}

// 恢复处理筛选条件变化的方法
const handleFilterChange = () => {
  currentPage.value = 1
  fetchMovies()
}

// 监听类型变化
watch([currentType, currentTypeId], () => {
  currentPage.value = 1
  fetchMovies()
}, { immediate: true })

// 组件挂载时添加滚动监听
onMounted(() => {
  fetchMovies()
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 处理图片URL
const getImageUrl = (url) => {
  if (!url) {
    return '/src/assets/default-poster.svg'
  }
  
  // 如果是相对路径，添加基础URL
  if (url.startsWith('/')) {
    return url
  }
  
  // 检查URL是否有效，如果无法加载则使用默认图片
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

// 新增：截断文本函数
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
</script>

<style scoped>
.tv {
  padding: 0 0 20px;
  background-color: var(--card-background);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.tv-header {
  margin-bottom: 0px;
  padding: 15px 15px 5px;
}

.tv-header h2 {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

/* 电视剧分类选项卡 */
.drama-type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  /* margin-bottom: 0px; */
  padding-bottom: 10px;
  overflow-x: auto;
}

.drama-tab {
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  white-space: nowrap;
  background-color: var(--hover-background);
  color: var(--text-color);
}

.drama-tab:hover {
  background-color: rgba(142, 68, 173, 0.1);
}

.drama-tab.active {
  background-color: #8e44ad; /* 紫色背景 */
  color: white;
}

.filter-select {
  width: 150px;
}

/* 加载状态 */
.loading-container {
  padding: 20px;
}

/* 影片网格 */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 0 15px;
}

.movie-card {
  background: transparent;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.movie-poster {
  position: relative;
  height: 250px;
  overflow: hidden;
  border-radius: 6px;
  background-color: var(--hover-background);
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

/* 集数标签 */
.episode-badge {
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

/* 新增：详情悬浮层样式 */
.movie-detail-overlay {
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

.movie-card:hover .movie-detail-overlay {
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

.movie-info {
  padding: 10px 0;
}

.movie-title {
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

.loading-more {
  padding: 20px;
  text-align: center;
}

/* 移除旧的分页样式 */
.pagination-container,
:deep(.pagination-dark) {
  display: none;
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
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .movie-poster {
    height: 220px;
  }
  
  .drama-type-tabs {
    overflow-x: auto;
    padding-bottom: 5px;
  }
  
  .drama-tab {
    padding: 6px 15px;
    font-size: 13px;
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