<template>
  <div class="movie-nav">
    <!-- 电影类型导航栏 -->
    <div class="movie-types">
      <div 
        v-for="type in movieTypes" 
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
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 电影列表 -->
    <div v-else class="movie-grid">
      <div v-for="movie in movies" :key="movie.vod_id" class="movie-card">
        <router-link :to="`/play/movie/${movie.vod_id}`" class="movie-link">
          <div class="movie-poster">
            <img 
              :src="getImageUrl(movie.vod_pic)" 
              :alt="movie.vod_name"
              @error="handleImageError($event)"
            >
            <!-- 显示标签 -->
            <div v-if="movie.vod_remarks" class="movie-badge">
              {{ movie.vod_remarks }}
            </div>
            
            <!-- 影片详情悬浮层 -->
            <div class="movie-detail-overlay">
              <h4 class="detail-title">{{ movie.vod_name }}</h4>
              <div v-if="movie.vod_year" class="detail-meta">{{ movie.vod_year }}</div>
              <div v-if="movie.vod_score && movie.vod_score !== '0.0'" class="detail-score">评分: {{ movie.vod_score }}</div>
              <div v-if="movie.vod_actor" class="detail-actors">
                {{ truncateText(movie.vod_actor, 30) }}
              </div>
              <div v-if="movie.vod_blurb || movie.vod_content" class="detail-desc">
                {{ truncateText(movie.vod_blurb || movie.vod_content, 50) }}
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
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 电影类型列表
const movieTypes = [
  { id: 6, name: '剧情片' },
  { id: 7, name: '动作片' },
  { id: 8, name: '冒险片' },
  { id: 26, name: '动画电影' },
  { id: 10, name: '喜剧片' },
  { id: 11, name: '奇幻片' },
  { id: 12, name: '恐怖片' },
  { id: 21, name: '惊悚片' },
  { id: 24, name: '犯罪片' },
  { id: 25, name: '科幻片' },
  { id: 20, name: '悬疑片' },
  { id: 23, name: '爱情片' },
  { id: 22, name: '灾难片' }
]

// 状态变量
const loading = ref(true)
const movies = ref([])
const currentPage = ref(1)
const pageSize = ref(24)
const totalMovies = ref(0)
const currentType = ref(6) // 默认剧情片

// 加载电影数据
const fetchMovies = async () => {
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
        movies.value = response.data.list
        totalMovies.value = parseInt(response.data.total) || 0
        
        // 输出获取到的第一条数据以供调试
        if (movies.value.length > 0) {
          console.log('第一条影片数据示例:', JSON.stringify(movies.value[0]))
        }
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
    6: '剧情片',
    7: '动作片',
    8: '冒险片',
    9: '动画电影',
    10: '喜剧片',
    11: '奇幻片',
    12: '恐怖片',
    20: '惊悚片',
    21: '犯罪片',
    22: '科幻片',
    23: '悬疑片',
    24: '爱情片',
    25: '灾难片'
  }
  
  const typeName = typeMap[typeId] || '电影'
  
  // 根据不同类型生成不同的电影名称示例
  let movieNames = [];
  switch(typeId) {
    case 20: // 惊悚片
      movieNames = ['致命ID', '致命魔术', '恐怖游轮', '闪灵', '禁闭岛'];
      break;
    case 21: // 犯罪片
      movieNames = ['教父', '无间道', '肖申克的救赎', '七宗罪', '低俗小说'];
      break;
    case 22: // 科幻片
      movieNames = ['星际穿越', '黑客帝国', '头号玩家', '2001太空漫游', '银翼杀手'];
      break;
    case 23: // 悬疑片
      movieNames = ['记忆碎片', '致命魔术', '第六感', '沉默的羔羊', '搏击俱乐部'];
      break;
    case 24: // 爱情片
      movieNames = ['泰坦尼克号', '爱乐之城', '初恋这件小事', '恋恋笔记本', '情书'];
      break;
    case 25: // 灾难片
      movieNames = ['后天', '全球风暴', '2012', '龙卷风', '海啸奇迹'];
      break;
    default:
      movieNames = [`${typeName}示例 1`, `${typeName}示例 2`, `${typeName}示例 3`, `${typeName}示例 4`, `${typeName}示例 5`];
  }
  
  // 生成模拟数据
  movies.value = Array.from({ length: 12 }, (_, i) => {
    const nameIndex = i % movieNames.length;
    return {
      vod_id: `${typeId}${1000 + i}`,
      vod_name: i < movieNames.length ? movieNames[i] : `${typeName}示例 ${i + 1}`,
      vod_pic: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2897209078.webp',
      vod_remarks: '',
      vod_year: '2024',
      vod_score: '8.0',
      vod_actor: '示例演员1, 示例演员2',
      vod_blurb: `这是一部精彩的${typeName}，剧情扣人心弦...`,
      vod_area: '欧美'
    };
  });
  
  totalMovies.value = 24;
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
  fetchMovies()
}

// 切换电影类型
const changeType = (typeId) => {
  currentType.value = typeId
  currentPage.value = 1
  fetchMovies()
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
  fetchMovies()
})
</script>

<style scoped>
.movie-nav {
  padding: 0 0 20px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

/* 电影类型导航栏 */
.movie-types {
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
  background-color: #f1f1f1;
  color: #333;
  white-space: nowrap;
}

.type-item:hover {
  background-color: #e0e0e0;
}

.type-item.active {
  background-color: #e74c3c; /* 红色背景 */
  color: white;
}

/* 加载状态 */
.loading-container {
  padding: 20px;
}

/* 电影网格 */
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
  background-color: #e0e0e0;
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

/* 标签 */
.movie-badge {
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
  color: #333;
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

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .movie-poster {
    height: 220px;
  }
  
  .type-item {
    padding: 6px 15px;
    font-size: 14px;
  }
}
</style> 