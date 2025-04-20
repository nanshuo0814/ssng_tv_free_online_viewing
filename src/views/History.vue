<template>
  <div class="history">
    <div class="history-header">
      <h2>观看历史</h2>
      <el-button type="danger" @click="confirmClearHistory" v-if="historyStore.history.length > 0">
        清空历史记录
      </el-button>
    </div>

    <el-empty v-if="historyStore.history.length === 0" description="暂无观看历史" />
    
    <div v-else>
      <div class="history-list">
        <div v-for="(item, index) in historyStore.history" :key="index" class="history-item">
          <div class="history-poster">
            <img :src="getMoviePoster(item)" :alt="item.title">
            <div class="play-overlay" @click="playMovie(item)">
              <el-icon><VideoPlay /></el-icon>
            </div>
          </div>
          <div class="history-info">
            <h3 class="history-title" @click="playMovie(item)">{{ item.title }}</h3>
            <p class="history-time">观看时间: {{ formatDate(item.timestamp) }}</p>
            <div class="history-actions">
              <el-button type="primary" size="small" @click="playMovie(item)" color="#2196f3">
                继续观看
              </el-button>
              <el-button type="danger" size="small" @click="removeHistory(item.id)">
                删除记录
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHistoryStore } from '@/stores/history'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'

const historyStore = useHistoryStore()
const router = useRouter()

// 模拟电影数据
const moviePosters = {
  '1': 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p511118051.webp', // 这个杀手不太冷
  '2': 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p480747492.webp', // 肖申克的救赎
  '3': 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2561716440.webp', // 霸王别姬
  // 默认海报
  'default': 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2614500649.webp'
}

const getMoviePoster = (item) => {
  return moviePosters[item.id] || moviePosters.default
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const playMovie = (item) => {
  router.push(item.url)
  ElMessage.success(`正在播放: ${item.title}`)
}

const removeHistory = (id) => {
  historyStore.removeFromHistory(id)
  ElMessage.success('已删除该条历史记录')
}

const confirmClearHistory = () => {
  ElMessageBox.confirm('确定要清空所有观看历史吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyStore.clearHistory()
    ElMessage.success('历史记录已清空')
  }).catch(() => {})
}
</script>

<style scoped>
.history {
  padding: 0 0 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.history-item:hover {
  transform: translateY(-3px);
}

[data-theme="dark"] .history-item {
  background-color: rgba(255, 255, 255, 0.05);
}

.history-poster {
  position: relative;
  width: 100px;
  height: 140px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
}

.history-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.play-overlay .el-icon {
  font-size: 40px;
  color: white;
}

.history-poster:hover .play-overlay {
  opacity: 1;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-title {
  margin: 0 0 10px;
  font-size: 18px;
  color: var(--text-color);
  cursor: pointer;
}

.history-title:hover {
  color: #2196f3;
}

.history-time {
  margin: 0 0 15px;
  font-size: 14px;
  color: var(--secondary-color);
}

.history-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
}
</style> 