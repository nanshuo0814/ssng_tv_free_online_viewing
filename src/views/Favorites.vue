<template>
  <!-- <div class="favorites-page"> -->
    <div class="favorites-header">
      <h2>我的收藏</h2>
      <el-button 
        type="danger" 
        size="small" 
        style="height: 32px;"
        @click="confirmClear"
        v-if="favoriteStore.getFavoritesCount > 0"
      >
        清空收藏
      </el-button>
    </div>

    <!-- 收藏数量提示 -->
    <div class="favorite-count-tip" v-if="favoriteStore.getFavoritesCount > 0">
      <el-icon><Star /></el-icon>
      <span>当前共收藏了 </span>
      <span class="count-number">{{ favoriteStore.getFavoritesCount }}</span>
      <span> 部影片</span>
    </div>

    <!-- 空状态 -->
    <div v-if="favoriteStore.getFavoritesCount === 0" class="empty-state">
      <el-empty description="暂无收藏" />
    </div>

    <!-- 收藏列表 -->
    <div v-else class="favorites-list">
      <div v-for="item in favoriteStore.getFavorites" :key="item.id" class="favorite-item">
        <router-link :to="`/video/detail/${item.id}`" class="favorite-content">
          <div class="favorite-poster">
            <img :src="item.poster" :alt="item.title" @error="handleImageError">
            <div v-if="item.remarks" class="remarks-badge">
              {{ item.remarks }}
            </div>
          </div>
          <div class="favorite-info">
            <div class="info-header">
              <h3 class="favorite-title">{{ item.title }}</h3>
              <div v-if="item.score" class="score">
                评分：<span class="score-value">{{ item.score }}</span>
              </div>
            </div>
            
            <div class="meta-info">
              <span v-if="item.year" class="meta-item">{{ item.year }}年</span>
              <span v-if="item.area" class="meta-item">{{ item.area }}</span>
              <span class="meta-item">{{ getTypeLabel(item.type) }}</span>
            </div>

            <div v-if="item.actors" class="actors">
              主演：{{ truncateText(item.actors, 50) }}
            </div>

            <div v-if="item.director" class="director">
              导演：{{ truncateText(item.director, 30) }}
            </div>

            <div class="favorite-meta">
              <span class="favorite-time">收藏时间：{{ formatTime(item.timestamp) }}</span>
            </div>
          </div>
        </router-link>
        <el-button 
          type="danger" 
          size="small" 
          circle
          class="delete-btn"
          @click="removeItem(item.id, item.title)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  <!-- </div> -->
</template>

<script setup>
import { onMounted } from 'vue'
import { useFavoriteStore } from '../stores/favorite'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Star } from '@element-plus/icons-vue'

const favoriteStore = useFavoriteStore()

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 如果是今天
  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  }

  // 如果是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `昨天 ${hours}:${minutes}`
  }

  // 其他日期
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    movie: '电影',
    tv: '电视剧',
    anime: '动漫',
    variety: '综艺',
    shorts: '短剧'
  }
  return typeMap[type] || type
}

// 处理图片加载失败
const handleImageError = (event) => {
  event.target.src = '/src/assets/default-poster.svg'
}

// 文本截断
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// 删除单个收藏
const removeItem = (id, title) => {
  ElMessageBox.confirm(
    `确定要取消收藏"${title}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (favoriteStore.removeFavorite(id)) {
      ElMessage.success('已取消收藏')
    }
  }).catch(() => {})
}

// 清空收藏
const confirmClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有收藏吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    favoriteStore.clearFavorites()
    ElMessage.success('已清空收藏')
  }).catch(() => {})
}

// 组件加载时从本地存储加载收藏
onMounted(() => {
  favoriteStore.loadFromLocal()
})
</script>

<style scoped>
.favorites-page {
  padding: 20px;
  background-color: var(--card-background);
  border-radius: 8px;
  min-height: calc(100vh - 180px);
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.favorites-header h2 {
  margin: 0;
  color: var(--text-color);
}

.favorite-count-tip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background-color: rgba(230, 162, 60, 0.1);
  border-radius: 4px;
  margin-bottom: 20px;
  color: var(--text-color-light);
  font-size: 14px;
}

.favorite-count-tip .el-icon {
  color: #E6A23C;
  font-size: 16px;
}

.count-number {
  font-weight: bold;
  font-size: 16px;
  color: #E6A23C;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.favorite-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background-color: var(--hover-background);
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.favorite-item:hover {
  transform: translateX(5px);
}

.favorite-content {
  display: flex;
  flex: 1;
  text-decoration: none;
  color: inherit;
  gap: 20px;
}

.favorite-poster {
  position: relative;
  width: 180px;
  height: 240px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.favorite-poster img {
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

.favorite-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.favorite-title {
  margin: 0;
  font-size: 20px;
  color: var(--text-color);
  flex: 1;
}

.score {
  font-size: 14px;
  color: var(--text-color-light);
}

.score-value {
  color: #ff9900;
  font-weight: bold;
}

.meta-info {
  display: flex;
  gap: 15px;
  color: var(--text-color-light);
  font-size: 14px;
}

.meta-item {
  background-color: var(--el-color-info-light-9);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.actors, .director {
  font-size: 14px;
  color: var(--text-color-light);
  line-height: 1.5;
}

.favorite-meta {
  margin-top: auto;
  color: var(--text-color-light);
  font-size: 13px;
}

.delete-btn {
  margin-left: 15px;
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 10px;
  }

  .favorite-item {
    padding: 10px;
  }

  .favorite-content {
    gap: 12px;
  }

  .favorite-poster {
    width: 120px;
    height: 160px;
  }

  .favorite-title {
    font-size: 16px;
  }

  .meta-info {
    flex-wrap: wrap;
    gap: 8px;
  }

  .actors, .director {
    font-size: 12px;
  }
}
</style> 