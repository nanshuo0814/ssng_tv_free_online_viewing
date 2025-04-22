<template>
  <!-- <div class="history-page"> -->
    <div class="history-header">
      <h2>观看历史</h2>
      <el-button 
        type="danger" 
        size="small" 
        @click="confirmClear"
        v-if="historyStore.getHistory.length > 0"
      >
        清空历史
      </el-button>
    </div>

    <!-- 空状态 -->
    <div v-if="historyStore.getHistory.length === 0" class="empty-state">
      <el-empty description="暂无观看历史" />
    </div>

    <!-- 历史记录列表 -->
    <div v-else class="history-list">
      <div v-for="item in historyStore.getHistory" :key="item.id" class="history-item">
        <router-link :to="item.url" class="history-content">
          <div class="history-poster">
            <img :src="item.poster" :alt="item.title" @error="handleImageError">
            <div v-if="item.remarks" class="remarks-badge">
              {{ item.remarks }}
            </div>
          </div>
          <div class="history-info">
            <div class="info-header">
              <h3 class="history-title">{{ item.title }}</h3>
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

            <div class="history-meta">
              <span class="history-time">观看时间：{{ formatTime(item.timestamp) }}</span>
            </div>
          </div>
        </router-link>
        <el-button 
          type="danger" 
          size="small" 
          circle
          class="delete-btn"
          @click="removeItem(item.id)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  <!-- </div> -->
</template>

<script setup>
import { onMounted } from 'vue'
import { useHistoryStore } from '../stores/history'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

const historyStore = useHistoryStore()

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

// 删除单个记录
const removeItem = (id) => {
  ElMessageBox.confirm(
    '确定要删除这条观看记录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    historyStore.removeHistory(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 清空历史记录
const confirmClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有观看历史吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    historyStore.clearHistory()
    ElMessage.success('已清空观看历史')
  }).catch(() => {})
}

// 组件加载时从本地存储加载历史记录
onMounted(() => {
  historyStore.loadFromLocal()
})
</script>

<style scoped>
.history-page {
  padding: 20px;
  background-color: var(--card-background);
  border-radius: 8px;
  min-height: calc(100vh - 180px);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h2 {
  margin: 0;
  color: var(--text-color);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background-color: var(--hover-background);
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.history-item:hover {
  transform: translateX(5px);
}

.history-content {
  display: flex;
  flex: 1;
  text-decoration: none;
  color: inherit;
  gap: 20px;
}

.history-poster {
  position: relative;
  width: 180px;
  height: 240px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.history-poster img {
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

.history-info {
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

.history-title {
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

.history-meta {
  margin-top: auto;
  color: var(--text-color-light);
  font-size: 13px;
}

.delete-btn {
  margin-left: 15px;
}

@media (max-width: 768px) {
  .history-page {
    padding: 10px;
  }

  .history-item {
    padding: 10px;
  }

  .history-content {
    gap: 12px;
  }

  .history-poster {
    width: 120px;
    height: 160px;
  }

  .history-title {
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