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
        </div>
      </div>
    </div>

    <div class="search-results" v-if="filteredResults.length > 0">
      <div class="results-count">找到 {{ filteredResults.length }} 个结果</div>
      
      <div class="results-grid">
        <MovieCard 
          v-for="item in filteredResults" 
          :key="item.id" 
          :movie="item" 
        />
      </div>
      
      <div class="load-more" v-if="hasMoreResults && !isLoading">
        <button class="load-more-btn" @click="loadMore">加载更多</button>
      </div>
      
      <div class="loading" v-if="isLoading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
    </div>
    
    <div class="no-results" v-else-if="!isLoading && searchQuery">
      <img src="../assets/empty-search.svg" alt="没有结果" class="no-results-img" />
      <h3>未找到相关结果</h3>
      <p>请尝试其他关键词或浏览我们的推荐内容</p>
      
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
import MovieCard from '../components/MovieCard.vue'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const isLoading = ref(false)
const hasMoreResults = ref(true)
const page = ref(1)

// 筛选器
const filters = [
  { label: '全部', value: 'all' },
  { label: '电影', value: 'movie' },
  { label: '电视剧', value: 'tv' },
  { label: '动漫', value: 'anime' },
  { label: '人物', value: 'person' }
]

const currentFilter = ref('all')

// 热门搜索标签
const popularTags = [
  '肖申克的救赎',
  '漫威',
  '科幻',
  '悬疑',
  '动作',
  '周星驰',
  '宫崎骏',
  '阿凡达'
]

// 搜索结果
const searchResults = ref([
  // 模拟数据
  {
    id: 1,
    title: '肖申克的救赎',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    vote_average: 8.7,
    release_date: '1994-09-23',
    media_type: 'movie'
  },
  {
    id: 2,
    name: '绝命毒师',
    poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    vote_average: 8.5,
    first_air_date: '2008-01-20',
    media_type: 'tv'
  },
  {
    id: 3,
    title: '千与千寻',
    poster_path: '/dL40lUiuCVL2rvMZLHwP8b8fSW3.jpg',
    vote_average: 8.5,
    release_date: '2001-07-20',
    media_type: 'anime'
  },
  {
    id: 4,
    name: '汤姆·汉克斯',
    profile_path: '/xndWFsBlClOJFRdhSt4NBwiPq2o.jpg',
    media_type: 'person'
  }
])

// 根据筛选器过滤结果
const filteredResults = computed(() => {
  if (currentFilter.value === 'all') {
    return searchResults.value
  }
  
  return searchResults.value.filter(item => item.media_type === currentFilter.value)
})

// 设置筛选器
const setFilter = (filter) => {
  currentFilter.value = filter
}

// 加载更多结果
const loadMore = () => {
  isLoading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    // 模拟加载下一页数据
    const newResults = [
      {
        id: 5,
        title: '这个杀手不太冷',
        poster_path: '/yTZpDFqVN2nEsW6bmLLRaJIAK8a.jpg',
        vote_average: 8.3,
        release_date: '1994-09-14',
        media_type: 'movie'
      },
      {
        id: 6,
        name: '权力的游戏',
        poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
        vote_average: 8.4,
        first_air_date: '2011-04-17',
        media_type: 'tv'
      }
    ]
    
    searchResults.value = [...searchResults.value, ...newResults]
    page.value++
    
    // 假设总共只有两页结果
    if (page.value >= 2) {
      hasMoreResults.value = false
    }
    
    isLoading.value = false
  }, 1000)
}

// 搜索标签
const searchTag = (tag) => {
  router.push({
    path: '/search',
    query: { q: tag }
  })
}

// 执行搜索
const performSearch = (query) => {
  if (!query) return
  
  searchQuery.value = query
  isLoading.value = true
  page.value = 1
  hasMoreResults.value = true
  
  // 实际应用中应该调用API
  // searchApi(query, page.value)
  //   .then(data => {
  //     searchResults.value = data.results
  //     hasMoreResults.value = page.value < data.total_pages
  //     isLoading.value = false
  //   })
  
  // 模拟API延迟
  setTimeout(() => {
    isLoading.value = false
    // 在真实应用中，这里应该是API返回的数据
  }, 800)
}

// 监听路由变化
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    performSearch(newQuery)
  } else {
    searchResults.value = []
    searchQuery.value = ''
  }
}, { immediate: true })
</script>

<style scoped>
.search-page {
  padding: 20px var(--content-padding);
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
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-item:hover {
  background-color: var(--hover-background);
}

.filter-item.active {
  background-color: var(--primary-color);
  color: white;
}

.search-results {
  margin-top: 20px;
}

.results-count {
  margin-bottom: 20px;
  color: var(--text-color-light);
  font-size: 14px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.load-more-btn {
  padding: 10px 20px;
  background-color: var(--card-background);
  color: var(--text-color);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.load-more-btn:hover {
  background-color: var(--hover-background);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: var(--text-color-light);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-results {
  text-align: center;
  padding: 60px 0;
  color: var(--text-color);
}

.no-results-img {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.no-results h3 {
  font-size: 20px;
  margin: 0 0 10px;
}

.no-results p {
  color: var(--text-color-light);
  margin-bottom: 30px;
}

.suggestions {
  max-width: 500px;
  margin: 0 auto;
}

.suggestions h4 {
  margin-bottom: 15px;
  font-size: 16px;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.suggestion-tag {
  padding: 6px 12px;
  background-color: var(--card-background);
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-tag:hover {
  background-color: var(--hover-background);
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
  
  .search-title {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .filter-item {
    padding: 4px 12px;
    font-size: 12px;
  }
}
</style> 