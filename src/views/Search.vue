<template>
  <div class="search-page">
    <div class="search-header">
      <h2 class="search-title">搜索结果: "{{ searchQuery }}"</h2>
      <div class="search-actions">
        <el-select 
          v-model="currentSource" 
          placeholder="选择播放源" 
          size="large"
          @change="handleSourceChange"
          class="source-select"
        >
          <el-option 
            v-for="sourceItem in availableSources" 
            :key="sourceItem.value" 
            :label="sourceItem.label" 
            :value="sourceItem.value"
          />
        </el-select>
        <div class="search-filters">
          <div 
            v-for="(filter, index) in filters" 
            :key="index"
            :class="['filter-item', { active: currentFilter === filter.value }]"
            @click="setFilter(filter.value)"
          >
            {{ filter.label }}
            <span class="filter-count" v-if="currentFilter === filter.value">
              ({{ filteredResults.length }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading && page === 1" class="loading-container">
      <div class="custom-loader">
        <div class="loader-wave">
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
        </div>
        <div class="loader-text">正在搜索...</div>
      </div>
    </div>

    <div class="search-results" v-else-if="filteredResults.length > 0">
      <div class="results-count">
        找到 {{ totalResults }} 个结果
      </div>
      
      <div class="results-grid">
        <div 
          v-for="item in filteredResults" 
          :key="item.id" 
          class="movie-card"
          @click="router.push(`/video/detail/${item.id}?source=${currentSource}`)"
        >
          <div class="movie-poster">
            <img 
              :src="item.poster" 
              :alt="item.title"
              @error="$event.target.src = '/src/assets/default-poster.svg'"
            >
            <div v-if="item.remarks" class="remarks-badge">
              {{ item.remarks }}
            </div>
            <div class="source-badge" v-if="item.source && item.source !== 'api'">
              {{ getSourceLabel(item.source) }}
            </div>
          </div>
          <div class="movie-info">
            <h3 class="movie-title">{{ item.title }}</h3>
            <div class="movie-meta">
              <span style="text-align: center;" v-if="item.year">{{ item.year }}</span>
              <span v-if="item.area">{{ item.area }}</span>
              <span v-if="item.score" class="score">
                评分：{{ item.score }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-more">
        <el-skeleton :rows="1" animated />
      </div>
      
      <div class="load-more" v-else-if="hasMoreResults">
        <el-button type="primary" @click="loadMore">加载更多</el-button>
      </div>
    </div>
    
    <div class="no-results" v-else-if="!isLoading && searchQuery">
      <el-empty description="未找到相关结果">
        <template #description>
          <p>未找到"{{ searchQuery }}"相关的内容</p>
          <p class="sub-text">请尝试其他关键词或播放源</p>
        </template>
      </el-empty>
      
      <!-- 搜索历史 -->
      <div class="search-history" v-if="searchHistoryStore.history.length > 0">
        <div class="history-header">
          <h4>搜索历史</h4>
          <el-button link @click="clearHistory">清空历史</el-button>
        </div>
        <div class="history-tags">
          <div 
            v-for="(keyword, index) in searchHistoryStore.history" 
            :key="index"
            class="history-tag"
          >
            <span class="keyword" @click="searchTag(keyword)">{{ keyword }}</span>
            <el-icon class="delete-icon" @click="removeHistory(keyword, $event)">
              <Close />
            </el-icon>
          </div>
        </div>
      </div>
      
      <div class="suggestions">
        <h4>热门搜索</h4>
        <div class="suggestion-tags">
          <div 
            v-for="(tag, index) in popularTags" 
            :key="index"
            class="suggestion-tag"
            @click="searchTag(tag)"
          >
            {{ tag }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSearchHistoryStore } from '../stores/searchHistory'
import { Close } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const searchHistoryStore = useSearchHistoryStore()

const searchQuery = ref('')
const isLoading = ref(false)
const hasMoreResults = ref(true)
const page = ref(1)
const pageSize = ref(24)
const totalResults = ref(0)

// 播放源相关
const currentSource = ref('api')
const availableSources = ref([
  { label: '黑木耳', value: 'api' },
  { label: '爱坤', value: 'ikun' },
  { label: '卧龙', value: 'wolong' },
  { label: '360', value: '360' },
  { label: '华为', value: 'huawei' },
  { label: '急速', value: 'jisu' },
  { label: '速播', value: 'subo' },
])

// 获取播放源显示名称
const getSourceLabel = (sourceValue) => {
  const source = availableSources.value.find(src => src.value === sourceValue)
  return source ? source.label : sourceValue
}

// 筛选器
const filters = [
  { label: '全部', value: 'all' },
  { label: '电影', value: 'movie' },
  { label: '电视剧', value: 'tv' },
  { label: '动漫', value: 'anime' },
  { label: '综艺', value: 'variety' },
  { label: '短剧', value: 'shorts' }
]

const currentFilter = ref('all')

// 热门搜索标签
const popularTags = [
  '斗罗大陆',
  '完美世界',
  '斗破苍穹',
  '仙逆',
  '吞噬星空',
  '师兄啊师兄',
]

// 搜索结果
const searchResults = ref([])

// 根据筛选器过滤结果
const filteredResults = computed(() => {
  if (currentFilter.value === 'all') {
    return searchResults.value
  }
  
  // 根据type_id判断类型
  return searchResults.value.filter(item => {
    const typeId = parseInt(item.type_id)
    switch (currentFilter.value) {
      case 'movie':
        return typeId >= 1 && typeId <= 12
      case 'tv':
        return typeId >= 13 && typeId <= 16
      case 'anime':
        return typeId === 4
      case 'variety':
        return typeId === 3
      case 'shorts':
        return typeId >= 45 && typeId <= 56  // 添加短剧的type_id范围
      default:
        return true
    }
  })
})

// 处理播放源变更
const handleSourceChange = (newSource) => {
  // 切换源并重新搜索
  currentSource.value = newSource
  performSearch(searchQuery.value, true)
}

// 设置筛选器
const setFilter = (filter) => {
  currentFilter.value = filter
}

// 加载更多结果
const loadMore = () => {
  page.value++
  performSearch(searchQuery.value, false)
}

// 搜索标签
const searchTag = (tag) => {
  router.push({
    path: '/search',
    query: { q: tag }
  })
}

// 执行搜索
const performSearch = async (query, resetResults = true) => {
  if (!query) return
  
  searchQuery.value = query
  isLoading.value = true
  
  // 添加到搜索历史
  searchHistoryStore.addHistory(query)
  
  if (resetResults) {
    page.value = 1
    searchResults.value = []
  }
  
  try {
    // 根据当前选择的源设置API端点
    let apiEndpoint = '/api';
    if (currentSource.value === 'ikun') {
      apiEndpoint = '/ikun';
    } else if (currentSource.value === 'subo') {
      apiEndpoint = '/subo';
    } else if (currentSource.value === 'huawei') {
      apiEndpoint = '/huawei';
    } else if (currentSource.value === 'jisu') {
      apiEndpoint = '/jisu';
    } else if (currentSource.value === '360') {
      apiEndpoint = '/360';
    } else if (currentSource.value === 'wolong') {
      apiEndpoint = '/wolong';
    }
    
    const response = await axios.get(`${apiEndpoint}/api.php/provide/vod/`, {
      params: {
        ac: 'videolist',
        pg: page.value - 1, // API使用0为起始页
        pagesize: pageSize.value,
        wd: encodeURIComponent(query)
      }
    }).catch(error => {
      console.error('API请求失败:', error);
      // 如果当前源请求失败，尝试使用默认API
      if (currentSource.value !== 'api') {
        console.log('尝试使用默认API获取信息');
        return axios.get(`/api/api.php/provide/vod/`, {
          params: {
            ac: 'videolist',
            pg: page.value - 1,
            pagesize: pageSize.value,
            wd: encodeURIComponent(query)
          }
        });
      }
      throw error;
    });
    
    const { code, msg, page: currentPage, pagecount, total, list } = response.data
    
    if (code === 1 && Array.isArray(list)) {
      // 转换API返回的数据格式
      const formattedResults = list.map(item => ({
        id: currentSource.value === 'api' ? item.vod_id : null, // 只有黑木耳源保留原始ID
        title: item.vod_name,
        poster: item.vod_pic,
        score: item.vod_score,
        remarks: item.vod_remarks,
        year: item.vod_year,
        area: item.vod_area,
        type_id: item.type_id,
        actors: item.vod_actor,
        director: item.vod_director,
        description: item.vod_content,
        source: currentSource.value, // 添加播放源标识
        isApiSource: true, // 标记为API来源
        heimuer_id: currentSource.value === 'api' ? item.vod_id : null // 保存黑木耳源ID
      }))
      
      // 如果不是黑木耳源，需要获取黑木耳源的影片ID
      if (currentSource.value !== 'api') {
        try {
          // 使用黑木耳源搜索相同影片
          const heimuerResponse = await axios.get(`/api/api.php/provide/vod/`, {
            params: {
              ac: 'videolist',
              wd: encodeURIComponent(query)
            }
          });
          
          if (heimuerResponse.data && heimuerResponse.data.code === 1 && 
              heimuerResponse.data.list && heimuerResponse.data.list.length > 0) {
            // 为每个搜索结果找到匹配的黑木耳源ID
            formattedResults.forEach(result => {
              const matchedMovie = heimuerResponse.data.list.find(item => 
                item.vod_name === result.title
              );
              if (matchedMovie) {
                result.id = matchedMovie.vod_id; // 使用黑木耳源的ID
              }
            });
          }
        } catch (error) {
          console.error('获取黑木耳源ID失败:', error);
        }
      }
      
      if (resetResults) {
        searchResults.value = formattedResults
      } else {
        searchResults.value = [...searchResults.value, ...formattedResults]
      }
      
      totalResults.value = total
      hasMoreResults.value = page.value < pagecount
    } else {
      ElMessage.error(msg || '搜索失败')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索请求失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 删除搜索历史
const removeHistory = (keyword, event) => {
  event.stopPropagation()
  searchHistoryStore.removeHistory(keyword)
}

// 清空搜索历史
const clearHistory = () => {
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

// 组件加载时从本地存储加载搜索历史
onMounted(() => {
  searchHistoryStore.loadFromLocal()
})

// 监听路由变化
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    performSearch(newQuery, true)
  } else {
    searchResults.value = []
    searchQuery.value = ''
  }
}, { immediate: true })

watch(() => route.query.source, (newSource) => {
  if (newSource && availableSources.value.some(s => s.value === newSource)) {
    currentSource.value = newSource
    if (searchQuery.value) {
      performSearch(searchQuery.value, true)
    }
  }
}, { immediate: true })

const searchInput = ref('')
const showDropdown = ref(false)

// 处理搜索
const handleSearch = () => {
  if (!searchInput.value.trim()) return
  router.push({
    path: '/search',
    query: { 
      q: searchInput.value.trim(),
      source: currentSource.value
    }
  })
  showDropdown.value = false
}

// 处理输入框失焦
const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
</script>

<style scoped>
.search-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
}

.search-header {
  margin-bottom: 30px;
}

.search-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.source-select {
  min-width: 120px;
}

.search-title {
  font-size: 24px;
  margin: 0;
  color: var(--text-color);
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.filter-item {
  padding: 6px 16px;
  background-color: var(--card-background);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);
  user-select: none;
}

.filter-item:hover {
  background-color: var(--theme-color-10);
}

.filter-item.active {
  background-color: var(--theme-color);
  color: white;
}

.filter-count {
  margin-left: 4px;
  font-size: 0.9em;
}

.results-count {
  margin-bottom: 20px;
  color: var(--text-color-light);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.movie-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  background-color: var(--card-background);
  border-radius: 8px;
  overflow: hidden;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  position: relative;
  width: 100%;
  padding-top: 150%; /* 2:3 aspect ratio */
}

.movie-poster img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remarks-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.source-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.movie-info {
  padding: 12px;
}

.movie-title {
  margin: 0;
  font-size: 14px;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-color-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

.movie-meta span {
  display: flex;
  align-items: center;
  line-height: 1;
}

.score {
  color: #ff9900;
}

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

.loading-more {
  padding: 20px 0;
}

.load-more {
  text-align: center;
  margin: 30px 0;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
}

.sub-text {
  color: var(--text-color-light);
  margin-top: 8px;
}

.suggestions {
  margin-top: 40px;
}

.suggestions h4 {
  color: var(--text-color);
  margin-bottom: 16px;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.suggestion-tag {
  padding: 6px 16px;
  background-color: var(--card-background);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);
}

.suggestion-tag:hover {
  background-color: var(--theme-color);
  color: white;
}

.search-history {
  margin: 30px 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-header h4 {
  color: var(--text-color);
  margin: 0;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.history-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: var(--card-background);
  border-radius: 20px;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.history-tag .keyword {
  cursor: pointer;
}

.history-tag:hover {
  background-color: var(--theme-color-10);
}

.delete-icon {
  cursor: pointer;
  font-size: 14px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.delete-icon:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .search-page {
    padding: 10px;
  }
  
  .search-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .source-select {
    width: 100%;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  
  .movie-title {
    font-size: 13px;
  }
  
  .movie-meta {
    font-size: 11px;
  }
}
</style> 