<template>
  <div class="favorites-page">
    <div class="favorites-header">
      <h2>我的收藏</h2>
      <button 
        class="clear-all-btn" 
        v-if="favorites.length > 0"
        @click="confirmClearAll"
      >
        <i class="el-icon-delete"></i> 清空收藏
      </button>
    </div>
    
    <div class="favorites-content">
      <div v-if="favorites.length > 0" class="favorites-list">
        <div 
          v-for="item in favorites" 
          :key="item.id"
          class="favorite-item"
        >
          <div class="favorite-poster">
            <img 
              :src="item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : defaultPoster" 
              :alt="item.title || item.name" 
              @click="navigateToDetail(item)"
            />
            <div class="favorite-actions">
              <button class="action-btn play-btn" @click="playMedia(item)">
                <i class="el-icon-video-play"></i>
              </button>
              <button class="action-btn remove-btn" @click="removeFavorite(item.id)">
                <i class="el-icon-delete"></i>
              </button>
            </div>
          </div>
          
          <div class="favorite-info">
            <h3 class="favorite-title" @click="navigateToDetail(item)">
              {{ item.title || item.name }}
            </h3>
            <div class="favorite-meta">
              <span class="favorite-date">
                {{ formatDate(item.added_date) }}
              </span>
              <span class="favorite-type">
                {{ getMediaTypeLabel(item.media_type) }}
              </span>
            </div>
            <div class="favorite-rating" v-if="item.vote_average">
              <i class="el-icon-star-on"></i>
              <span>{{ item.vote_average.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-favorites">
        <img src="../assets/empty-favorites.svg" alt="暂无收藏" class="empty-img" />
        <h3>您还没有收藏任何内容</h3>
        <p>浏览影片并点击收藏图标来添加您喜爱的内容</p>
        <button class="browse-btn" @click="goToHome">开始浏览</button>
      </div>
    </div>
    
    <div class="recommendations" v-if="recommendations.length > 0">
      <h3 class="section-title">为您推荐</h3>
      <div class="recommendations-grid">
        <MovieCard 
          v-for="item in recommendations" 
          :key="item.id" 
          :movie="item" 
          small
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MovieCard from '../components/MovieCard.vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const defaultPoster = ref('/src/assets/default-poster.jpg')

// 假设这里是从store中获取的收藏数据
const favorites = ref([
  {
    id: 1,
    title: '肖申克的救赎',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    vote_average: 8.7,
    media_type: 'movie',
    added_date: '2024-04-10T15:30:45.123Z'
  },
  {
    id: 2,
    name: '绝命毒师',
    poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    vote_average: 8.5,
    media_type: 'tv',
    added_date: '2024-04-12T09:15:22.987Z'
  },
  {
    id: 3,
    title: '千与千寻',
    poster_path: '/dL40lUiuCVL2rvMZLHwP8b8fSW3.jpg',
    vote_average: 8.5,
    media_type: 'anime',
    added_date: '2024-04-15T18:45:10.654Z'
  }
])

// 推荐内容
const recommendations = ref([
  {
    id: 4,
    title: '这个杀手不太冷',
    poster_path: '/yTZpDFqVN2nEsW6bmLLRaJIAK8a.jpg',
    vote_average: 8.3,
    media_type: 'movie'
  },
  {
    id: 5,
    name: '权力的游戏',
    poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    vote_average: 8.4,
    media_type: 'tv'
  },
  {
    id: 6,
    title: '海上钢琴师',
    poster_path: '/94vwXIwWXZK1LZsZkblNiir8yFs.jpg',
    vote_average: 8.2,
    media_type: 'movie'
  },
  {
    id: 7,
    name: '老友记',
    poster_path: '/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
    vote_average: 8.4,
    media_type: 'tv'
  }
])

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知日期'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取媒体类型标签
const getMediaTypeLabel = (type) => {
  const typeMap = {
    'movie': '电影',
    'tv': '电视剧',
    'anime': '动漫',
    'person': '人物'
  }
  
  return typeMap[type] || type
}

// 跳转到详情页
const navigateToDetail = (item) => {
  const mediaType = item.media_type
  router.push(`/${mediaType}/${item.id}`)
}

// 播放媒体
const playMedia = (item) => {
  const mediaType = item.media_type
  router.push(`/${mediaType}/${item.id}/play`)
}

// 删除收藏
const removeFavorite = (id) => {
  ElMessageBox.confirm('确定要从收藏中移除该内容吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 在实际应用中，这里应该调用store的方法删除收藏
    favorites.value = favorites.value.filter(item => item.id !== id)
    ElMessage.success('已从收藏中移除')
  }).catch(() => {
    // 取消操作
  })
}

// 清空所有收藏
const confirmClearAll = () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 在实际应用中，这里应该调用store的方法清空收藏
    favorites.value = []
    ElMessage.success('已清空所有收藏')
  }).catch(() => {
    // 取消操作
  })
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 加载收藏数据
const loadFavorites = () => {
  // 在实际应用中，这里应该从store加载收藏数据
}

// 加载推荐数据
const loadRecommendations = () => {
  // 在实际应用中，这里应该调用API获取推荐数据
}

onMounted(() => {
  loadFavorites()
  loadRecommendations()
})
</script>

<style scoped>
.favorites-page {
  padding: 20px var(--content-padding);
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.favorites-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-all-btn:hover {
  background-color: #f78989;
}

.favorites-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.favorite-item {
  display: flex;
  background-color: var(--card-background);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.favorite-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.favorite-poster {
  position: relative;
  width: 120px;
  height: 180px;
  flex-shrink: 0;
}

.favorite-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.favorite-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.favorite-item:hover .favorite-actions {
  opacity: 1;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.play-btn {
  background-color: var(--primary-color);
  color: white;
}

.play-btn:hover {
  background-color: var(--primary-color-dark);
}

.remove-btn {
  background-color: #f56c6c;
  color: white;
}

.remove-btn:hover {
  background-color: #f78989;
}

.favorite-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.favorite-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
}

.favorite-title:hover {
  color: var(--primary-color);
}

.favorite-meta {
  display: flex;
  gap: 10px;
  color: var(--text-color-light);
  font-size: 14px;
  margin-bottom: 10px;
}

.favorite-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #ff9900;
  font-weight: 500;
  margin-top: auto;
}

.empty-favorites {
  text-align: center;
  padding: 60px 0;
  color: var(--text-color);
}

.empty-img {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-favorites h3 {
  font-size: 20px;
  margin: 0 0 10px;
}

.empty-favorites p {
  color: var(--text-color-light);
  margin-bottom: 30px;
}

.browse-btn {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.browse-btn:hover {
  background-color: var(--primary-color-dark);
}

.section-title {
  font-size: 20px;
  margin: 0 0 20px;
  color: var(--text-color);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

@media (max-width: 992px) {
  .favorites-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .favorites-list {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .favorites-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .favorite-poster {
    width: 100px;
    height: 150px;
  }
  
  .favorite-title {
    font-size: 16px;
  }
  
  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style> 