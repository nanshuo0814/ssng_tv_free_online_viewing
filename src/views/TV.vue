<template>
  <div class="tv">
    <div class="tv-header">
      <h2>电视剧</h2>
      
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
      
      <!-- 恢复筛选条件区域 -->
      <!-- <div class="filter-bar">
        <el-select v-model="filterOrder" placeholder="排序方式" class="filter-select" @change="handleFilterChange">
          <el-option label="热门排序" value="popular"></el-option>
          <el-option label="评分排序" value="rating"></el-option>
          <el-option label="最新上线" value="newest"></el-option>
        </el-select>
        <el-select v-model="filterYear" placeholder="年代" class="filter-select" @change="handleFilterChange">
          <el-option label="全部" value="all"></el-option>
          <el-option label="2024" value="2024"></el-option>
          <el-option label="2023" value="2023"></el-option>
          <el-option label="2022" value="2022"></el-option>
          <el-option label="2021" value="2021"></el-option>
          <el-option label="2020" value="2020"></el-option>
          <el-option label="2010年代" value="2010s"></el-option>
          <el-option label="2000年代" value="2000s"></el-option>
          <el-option label="更早" value="earlier"></el-option>
        </el-select>
      </div> -->
      </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated :theme="isDarkTheme ? 'dark' : 'light'" />
    </div>

    <!-- 电影/剧集网格 -->
    <div v-else class="movie-grid">
      <div v-for="movie in displayMovies" :key="movie.vod_id" class="movie-card">
        <router-link :to="`/play/${currentType.value}/${movie.vod_id}`" class="movie-link">
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

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalMovies"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
        :background="true"
        class="pagination-dark"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { useThemeStore } from '../stores/theme'
import { ElMessage } from 'element-plus'
import { Star, VideoPlay } from '@element-plus/icons-vue'
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

// 加载影视数据
const fetchMovies = async () => {
  try {
    loading.value = true
    const typeId = currentTypeId.value
    
    if (!typeId) {
      movies.value = []
      totalMovies.value = 0
      loading.value = false
      return
    }
    
    console.log(`正在加载类型ID: ${typeId} 的数据，页码: ${currentPage.value}`)
    try {
      // 尝试使用不同的API接口获取数据
      const response = await axios.get(`/api/api.php/provide/vod/`, {
        params: {
          ac: 'videolist',  // 尝试使用videolist接口
          pg: currentPage.value,
          t: typeId,
          pagesize: pageSize.value,
        }
      })
      
      if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
        console.log(`成功获取数据，共 ${response.data.list?.length || 0} 条记录，总数 ${response.data.total || 0}`)
        // 过滤掉没有海报的影片
        movies.value = response.data.list.filter(movie => movie.vod_pic && movie.vod_pic !== '')
        totalMovies.value = parseInt(response.data.total) || 0
        
        // 输出获取到的第一条数据以供调试
        if (movies.value.length > 0) {
          console.log('第一条影片数据示例:', JSON.stringify(movies.value[0]))
        }
      } else {
        console.error('API返回错误或数据为空:', response.data)
        // 如果videolist接口失败，尝试使用list接口
        tryFallbackApi(typeId)
      }
    } catch (error) {
      console.error('API请求出错:', error)
      tryFallbackApi(typeId)
    }
  } catch (error) {
    console.error('获取数据出错:', error)
    loadFallbackData()
  } finally {
    loading.value = false
  }
}

// 尝试使用备用API
const tryFallbackApi = async (typeId) => {
  try {
    const response = await axios.get(`/api/api.php/provide/vod/`, {
      params: {
        ac: 'list',  // 尝试使用list接口
        pg: currentPage.value,
        t: typeId,
        pagesize: pageSize.value,
      }
    })
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      console.log(`备用API成功获取数据，共 ${response.data.list?.length || 0} 条记录`)
      // 过滤掉没有海报的影片
      movies.value = response.data.list.filter(movie => movie.vod_pic && movie.vod_pic !== '')
      totalMovies.value = parseInt(response.data.total) || 0
    } else {
      console.error('备用API也失败:', response.data)
      loadFallbackData(typeId)
    }
  } catch (error) {
    console.error('备用API请求出错:', error)
    loadFallbackData(typeId)
  }
}

// 加载备用数据
const loadFallbackData = (typeId) => {
  console.log('加载备用数据')
  ElMessage.warning('API请求失败，显示模拟数据')
  
  // 根据类型加载不同的备用数据
  if (typeId >= 13 && typeId <= 21) { // 电视剧类型
    // 使用截图中的一些电视剧名称
    movies.value = [
      { 
        vod_id: '1001', 
        vod_name: '借命而生', 
        vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2872088683.webp', 
        vod_remarks: '更新至8集' 
      },
      { 
        vod_id: '1002', 
        vod_name: '千秋令', 
        vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2892412130.webp', 
        vod_remarks: '更新至24集' 
      },
      { 
        vod_id: '1003', 
        vod_name: '无忧渡', 
        vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2892055553.webp', 
        vod_remarks: '更新至24集' 
      },
      { 
        vod_id: '1004', 
        vod_name: '吃饭跑步和恋爱', 
        vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2896546624.webp', 
        vod_remarks: '更新至23集' 
      },
      { 
        vod_id: '1005', 
        vod_name: '麻衣神婆', 
        vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2897209078.webp', 
        vod_remarks: '更新至12集' 
      },
      { 
        vod_id: '1006', 
        vod_name: '权宠', 
        vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903099161.webp', 
        vod_remarks: '更新至13集' 
      },
      { 
        vod_id: '1007', 
        vod_name: '她的机器亦', 
        vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2900018993.webp', 
        vod_remarks: '更新至20集' 
      },
      { 
        vod_id: '1008', 
        vod_name: '走火', 
        vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2899635076.webp', 
        vod_remarks: '更新至23集' 
      }
    ]
  } else {
    // 其他类型的备用数据
    movies.value = Array.from({ length: 12 }, (_, i) => ({
      vod_id: `${2000 + i}`,
      vod_name: `示例内容 ${i + 1}`,
      vod_pic: `https://img9.doubanio.com/view/photo/s_ratio_poster/public/p${2872088680 + i}.webp`,
      vod_remarks: `示例 ${i + 1}`
    }))
  }
  
  totalMovies.value = movies.value.length
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
  fetchMovies()
}

// 选择剧集类型
const selectDramaType = (type) => {
  dramaType.value = type
  currentPage.value = 1
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

// 页面加载时获取数据
onMounted(() => {
  fetchMovies()
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
  margin-bottom: 10px;
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

/* 恢复筛选条件样式 */
.filter-bar {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0 20px;
}

/* 分页暗黑模式样式 */
:deep(.pagination-dark .el-pagination.is-background .el-pager li:not(.is-disabled)) {
  background-color: var(--hover-background);
  color: var(--text-color);
}

:deep(.pagination-dark .el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #8e44ad; /* 紫色背景 */
  color: white;
}

:deep(.pagination-dark .el-pagination.is-background .btn-prev),
:deep(.pagination-dark .el-pagination.is-background .btn-next) {
  background-color: var(--hover-background);
  color: var(--text-color);
}

:deep(.pagination-dark .el-pagination .el-pagination__total) {
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
</style> 