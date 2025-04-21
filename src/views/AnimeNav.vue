<template>
  <div class="anime-nav">
    <h2 style="margin-bottom: 0px;
  padding: 15px 15px 5px;">动漫</h2>
    <!-- 动漫类型导航栏 -->
    <div class="anime-types">
      <div 
        v-for="type in animeTypes" 
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
      <el-skeleton :rows="5" animated :theme="isDarkTheme ? 'dark' : 'light'" />
    </div>

    <!-- 动漫列表 -->
    <div v-else class="anime-grid">
      <div v-for="anime in animes" :key="anime.vod_id" class="anime-card">
        <router-link :to="`/video/detail/${anime.vod_id}`" class="anime-link">
          <div class="anime-poster">
            <img 
              :src="getImageUrl(anime.vod_pic)" 
              :alt="anime.vod_name"
              @error="handleImageError($event)"
            >
            <!-- 显示标签 -->
            <div v-if="anime.vod_remarks" class="anime-badge">
              {{ anime.vod_remarks }}
            </div>
            
            <!-- 详情悬浮层 -->
            <div class="anime-detail-overlay">
              <h4 class="detail-title">{{ anime.vod_name }}</h4>
              <div v-if="anime.vod_year" class="detail-meta">{{ anime.vod_year }}</div>
              <div v-if="anime.vod_score && anime.vod_score !== '0.0'" class="detail-score">评分: {{ anime.vod_score }}</div>
              <div v-if="anime.vod_actor" class="detail-actors">
                {{ truncateText(anime.vod_actor, 30) }}
              </div>
              <div v-if="anime.vod_blurb || anime.vod_content" class="detail-desc">
                {{ truncateText(anime.vod_blurb || anime.vod_content, 50) }}
              </div>
            </div>
          </div>
          <div class="anime-info">
            <h3 class="anime-title">{{ anime.vod_name }}</h3>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalAnimes"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
        :background="true"
        class="pagination-dark"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useThemeStore } from '../stores/theme'

// 获取主题状态
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.theme === 'dark')

// 动漫类型列表
const animeTypes = [
  { id: 60, name: '国产动漫' },
  { id: 57, name: '欧美动漫' },
  { id: 58, name: '日本动漫' },
  { id: 59, name: '韩国动漫' },
  { id: 61, name: '港台动漫' },
  // { id: 62, name: '新马泰动漫' },
  { id: 63, name: '其它动漫' }
]

// 状态变量
const loading = ref(true)
const animes = ref([])
const currentPage = ref(1)
const pageSize = ref(24)
const totalAnimes = ref(0)
const currentType = ref(60) // 默认国产动漫

// 加载动漫数据
const fetchAnimes = async () => {
  try {
    loading.value = true
    const typeId = currentType.value
    
    console.log(`正在加载类型ID: ${typeId} 的数据，页码: ${currentPage.value}`)
    try {
      // 使用API获取数据
      const response = await axios.get(`/api/api.php/provide/vod/`, {
        params: {
          ac: 'videolist',
          pg: currentPage.value,
          pagesize: pageSize.value,
          t: typeId
        }
      })
      
      if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
        console.log(`成功获取数据，共 ${response.data.list?.length || 0} 条记录，总数 ${response.data.total || 0}`)
        animes.value = response.data.list
        totalAnimes.value = parseInt(response.data.total) || 0
      } else {
        console.error('API返回错误或数据为空:', response.data)
        loadFallbackData(typeId)
      }
    } catch (error) {
      console.error('API请求出错:', error)
      loadFallbackData(typeId)
    }
  } catch (error) {
    console.error('获取数据出错:', error)
    loadFallbackData()
  } finally {
    loading.value = false
  }
}

// 加载备用数据
const loadFallbackData = (typeId) => {
  console.log('加载备用数据')
  ElMessage.warning('API请求失败，显示模拟数据')
  
  // 根据类型加载不同的备用数据
  const typeMap = {
    60: '国产动漫',
    57: '欧美动漫',
    58: '日本动漫',
    59: '韩国动漫',
    61: '港台动漫',
    // 62: '新马泰动漫',
    63: '其它动漫'
  }
  
  const typeName = typeMap[typeId] || '动漫'
  
  // 根据不同类型生成不同的动漫名称示例
  let animeNames = [];
  switch(typeId) {
    case 60: // 国产动漫
      animeNames = ['吞噬星空', '斗罗剑仙', '沧元图', '武动乾坤', '完美世界', '星辰变', '元尊'];
      break;
    case 61: // 欧美动漫
      animeNames = ['瑞克和莫蒂', '爱，死亡和机器人', '辛普森一家', '海绵宝宝', '马男波杰克'];
      break;
    case 62: // 日本动漫
      animeNames = ['海贼王', '鬼灭之刃', '火影忍者', '进击的巨人', '咒术回战', '间谍过家家'];
      break;
    case 63: // 韩国动漫
      animeNames = ['神之塔', '打工吧魔王大人', '高校之神', '地狱朋友', '巴士车长'];
      break;
    default:
      animeNames = [`${typeName}示例 1`, `${typeName}示例 2`, `${typeName}示例 3`, `${typeName}示例 4`, `${typeName}示例 5`];
  }
  
  // 生成模拟数据
  animes.value = Array.from({ length: 12 }, (_, i) => {
    const nameIndex = i % animeNames.length;
    return {
      vod_id: `${typeId}${1000 + i}`,
      vod_name: i < animeNames.length ? animeNames[i] : `${typeName}示例 ${i + 1}`,
      vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2597919467.webp',
      vod_remarks: '更新至24集',
      vod_year: '2024',
      vod_score: '8.5',
      vod_actor: '配音演员1, 配音演员2',
      vod_blurb: `这是一部精彩的${typeName}，热血沸腾...`,
      vod_area: typeId === 60 ? '中国' : (typeId === 62 ? '日本' : '欧美')
    };
  });
  
  totalAnimes.value = 24;
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
  fetchAnimes()
}

// 切换动漫类型
const changeType = (typeId) => {
  currentType.value = typeId
  currentPage.value = 1
  fetchAnimes()
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

// 页面加载时获取数据
onMounted(() => {
  fetchAnimes()
})
</script>

<style scoped>
.anime-nav {
  padding: 0 0 20px;
  background-color: var(--card-background);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

/* 动漫类型导航栏 */
.anime-types {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  margin-bottom: 15px;
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
  background-color: rgba(25, 118, 210, 0.1);
}

.type-item.active {
  background-color: #1976d2; /* 蓝色背景 */
  color: white;
}

/* 加载状态 */
.loading-container {
  padding: 20px;
}

/* 动漫网格 */
.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 0 15px;
}

.anime-card {
  background: transparent;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.anime-card:hover {
  transform: translateY(-5px);
}

.anime-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.anime-poster {
  position: relative;
  height: 250px;
  overflow: hidden;
  border-radius: 6px;
  background-color: var(--hover-background);
}

.anime-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-card:hover .anime-poster img {
  transform: scale(1.05);
}

/* 标签 */
.anime-badge {
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
.anime-detail-overlay {
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

.anime-card:hover .anime-detail-overlay {
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

.anime-info {
  padding: 10px 0;
}

.anime-title {
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
  background-color: #1976d2; /* 蓝色背景 */
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
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .anime-poster {
    height: 220px;
  }
  
  .type-item {
    padding: 6px 15px;
    font-size: 14px;
  }
}
</style> 