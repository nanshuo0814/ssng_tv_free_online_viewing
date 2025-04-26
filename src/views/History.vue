<template>
  <!-- <div class="history-page"> -->
    <div class="history-header">
      <div class="header-left">
        <h2>观看历史</h2>
        <el-button 
          type="danger" 
          size="small" 
          @click="confirmClear"
          v-if="historyStore.getHistory.length > 0"
        >
          清空历史
        </el-button>
        <el-select
          v-model="sourceFilter"
          placeholder="所有来源"
          clearable
          class="source-filter"
          @change="handleFilterChange"
        >
          <el-option
            v-for="source in availableSources"
            :key="source.value"
            :label="source.label"
            :value="source.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredHistory.length === 0" class="empty-state">
      <el-empty :description="sourceFilter ? '没有相关来源的观看记录' : '暂无观看历史'" />
    </div>

    <!-- 历史记录列表 -->
    <div v-else class="history-list">
      <div v-for="item in filteredHistory" :key="item.id" class="history-item">
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
              <span v-if="item.source" class="source-tag" :class="getSourceClass(item.source)">
                {{ getSourceName(item.source) }}
              </span>
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
import { ref, computed, onMounted } from 'vue'
import { useHistoryStore } from '../stores/history'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

const historyStore = useHistoryStore()
const sourceFilter = ref('')

// 所有可用的播放源
const availableSources = [
  { value: 'api', label: '黑木耳' },
  { value: 'ikun', label: '爱坤' },
  { value: 'wolong', label: '卧龙' },
  { value: '360', label: '360' },
  { value: 'huawei', label: '华为' },
  { value: 'jisu', label: '急速' },
  { value: 'subo', label: '速播' }
]

// 根据播放源筛选历史记录
const filteredHistory = computed(() => {
  if (!sourceFilter.value) {
    return historyStore.getHistory
  }
  return historyStore.getHistory.filter(item => item.source === sourceFilter.value)
})

// 处理筛选变化
const handleFilterChange = () => {
  // 可以在这里添加额外的筛选逻辑
}

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

// 获取播放源名称
const getSourceName = (source) => {
  const sourceMap = {
    'api': '黑木耳',
    'ikun': '爱坤',
    'wolong': '卧龙',
    'play': 'Play',
    '360': '360',
    'huawei': '华为',
    'jisu': '急速',
    'subo': '速播'
  }
  return sourceMap[source] || source
}

// 获取播放源样式类
const getSourceClass = (source) => {
  return `source-${source}`
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

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.source-filter {
  width: 140px;
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
  flex-wrap: wrap;
}

.meta-item {
  background-color: var(--el-color-info-light-9);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 播放源标签样式 */
.source-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.source-api {
  background-color: #409EFF;
}

.source-ikun {
  background-color: #67C23A;
}

.source-wolong {
  background-color: #E6A23C;
}

.source-play {
  background-color: #F56C6C;
}

.source-360 {
  background-color: #909399;
}

.source-huawei {
  background-color: #9B59B6;
}

.source-jisu {
  background-color: #3498DB;
}

.source-subo {
  background-color: #16A085;
}

/* 暗黑模式下的播放源标签样式 */
:root[data-theme="dark"] .source-tag {
  opacity: 0.9;
}

:root[data-theme="dark"] .source-api {
  background-color: rgba(64, 158, 255, 0.8);
}

:root[data-theme="dark"] .source-ikun {
  background-color: rgba(103, 194, 58, 0.8);
}

:root[data-theme="dark"] .source-wolong {
  background-color: rgba(230, 162, 60, 0.8);
}

:root[data-theme="dark"] .source-play {
  background-color: rgba(245, 108, 108, 0.8);
}

:root[data-theme="dark"] .source-360 {
  background-color: rgba(144, 147, 153, 0.8);
}

:root[data-theme="dark"] .source-huawei {
  background-color: rgba(155, 89, 182, 0.8);
}

:root[data-theme="dark"] .source-jisu {
  background-color: rgba(52, 152, 219, 0.8);
}

:root[data-theme="dark"] .source-subo {
  background-color: rgba(22, 160, 133, 0.8);
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

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
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