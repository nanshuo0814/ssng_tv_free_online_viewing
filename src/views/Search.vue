<template>
  <div class="search-page">
    <div class="search-header">
      <h2 class="search-title">搜索结果: "{{ searchQuery }}"</h2>
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

    <div v-if="isLoading && page === 1" class="loading-container">
      <el-skeleton :rows="5" animated />
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
          @click="router.push(`/video/detail/${item.id}`)"
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
          <p class="sub-text">请尝试其他关键词或浏览以下推荐内容</p>
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
    const response = await axios.get('/api/api.php/provide/vod/', {
      params: {
        ac: 'videolist',
        pg: page.value - 1, // API使用0为起始页
        pagesize: pageSize.value,
        wd: encodeURIComponent(query)
      }
    })
    
    const { code, msg, page: currentPage, pagecount, total, list } = response.data
    
    if (code === 1 && Array.isArray(list)) {
      // 转换API返回的数据格式
      const formattedResults = list.map(item => ({
        id: item.vod_id,
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
        isApiSource: true // 标记为API来源
      }))
      
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

const searchInput = ref('')
const showDropdown = ref(false)

// 处理搜索
const handleSearch = () => {
  if (!searchInput.value.trim()) return
  router.push({
    path: '/search',
    query: { q: searchInput.value.trim() }
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

.search-title {
  font-size: 24px;
  margin: 0 0 20px;
  color: var(--text-color);
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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

/* 添加新的样式 */
.search-input-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto 30px;
}

.search-input-wrapper {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--card-background);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px var(--theme-color-10);
}

.search-button {
  padding: 0 24px;
  font-size: 16px;
  border-radius: 8px;
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
}

.history-item:hover {
  background-color: var(--theme-color-10);
}

.history-text {
  color: var(--text-color);
}

.delete-icon {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.delete-icon:hover {
  opacity: 1;
}
</style> 