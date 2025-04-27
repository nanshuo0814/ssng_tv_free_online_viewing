<template>
  <!-- <div class="history-page"> -->
    <div class="history-header">
      <h2 class="history">观看历史</h2>
      <div class="header-controls">
        <el-button 
          type="danger" 
          size="small" 
          style="height: 30px;"
          @click="confirmClear"
          v-if="historyStore.getHistory.length > 0"
          class="clear-btn"
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

    <!-- 类型筛选区域 -->
    <div class="type-filter-row" v-if="historyStore.getHistory.length > 0">
      <div class="custom-filter">
        <el-popover
          placement="bottom-start"
          :width="isMobile ? '90vw' : 480"
          trigger="click"
          v-model:visible="popoverVisible"
          popper-class="filter-popover"
        >
          <template #reference>
            <el-button type="primary">
              {{ selectedLabel || '按类型筛选' }}
              <el-icon><arrow-down /></el-icon>
            </el-button>
          </template>
          <div class="filter-popover-content">
            <div class="filter-left">
              <div 
                v-for="(item, index) in typeOptions" 
                :key="item.value"
                class="filter-category"
                :class="{ active: activeParentIndex === index }"
                @click="selectParentCategory(index)"
              >
                {{ item.label }}
                <el-icon><arrow-right /></el-icon>
              </div>
            </div>
            <div class="filter-right">
              <div 
                v-for="(subitem, subindex) in activeSubOptions" 
                :key="subitem.value"
                class="filter-subcategory"
                :class="{ active: selectedSubValue === subitem.value }"
                @click="selectSubCategory(activeParentIndex, subitem)"
              >
                {{ subitem.label }}
              </div>
            </div>
          </div>
          <div class="filter-footer">
            <el-button size="small" @click="clearFilter">清除筛选</el-button>
          </div>
        </el-popover>
      </div>
    </div>

    <!-- 当前筛选标签显示 -->
    <div class="current-filter-section" v-if="selectedLabel">
      <div class="current-filter">
        当前筛选: <el-tag size="small" closable @close="clearFilter">{{ selectedLabel }}</el-tag>
      </div>
    </div>

    <!-- 顶部历史记录限制提示 -->
    <div class="history-limit-header" v-if="historyStore.getHistory.length > 0">
      <el-progress 
        :percentage="historyPercentage" 
        :stroke-width="8"
        :color="historyProgressColor"
        :format="formatHistoryPercentage"
        class="history-progress"
      />
      <div class="limit-text">
        <el-icon><InfoFilled /></el-icon>
        <span>系统最多保存50条观看历史记录，当前已使用 {{ historyStore.getHistory.length }}/50</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredHistory.length === 0" class="empty-state">
      <el-empty :description="sourceFilter ? '没有相关来源的观看记录' : '暂无观看历史'" />
    </div>

    <!-- 历史记录列表 -->
    <div v-else class="history-list">
      <div v-for="(item, index) in filteredHistory" :key="`${item.id}_${item.source}_${index}_${item.timestamp}`" class="history-item">
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
              <!-- <span class="meta-item">{{ getTypeLabel(item.type) }}</span> -->
              <span class="meta-item">{{ item.type }}</span>
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
        <div class="item-actions">
          <el-button 
            type="danger" 
            size="small" 
            circle
            class="action-btn delete-btn"
            title="删除记录"
            @click="removeItem(item.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  <!-- </div> -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHistoryStore } from '../stores/history'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, InfoFilled, ArrowDown, ArrowRight } from '@element-plus/icons-vue'

const historyStore = useHistoryStore()
const sourceFilter = ref('')
const selectedType = ref([])
const selectedLabel = ref('')
const popoverVisible = ref(false)
const activeParentIndex = ref(0)
const selectedSubValue = ref('')

// 是否为移动端
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', checkMobile)
  return () => {
    window.removeEventListener('resize', checkMobile)
  }
})

// 检查设备类型
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 类型筛选配置
const typeOptions = [
  {
    value: 'movie',
    label: '电影',
    children: [
      { value: 'action', label: '动作片' },
      { value: 'comedy', label: '喜剧片' },
      { value: 'romance', label: '爱情片' },
      { value: 'sci-fi', label: '科幻片' },
      { value: 'horror', label: '恐怖片' },
      { value: 'drama', label: '剧情片' },
      { value: 'war', label: '战争片' },
      { value: 'documentary', label: '纪录片' }
    ]
  },
  {
    value: 'tv',
    label: '电视剧',
    children: [
      { value: 'mainland', label: '国产剧' },
      { value: 'hongkong', label: '港台剧' },
      { value: 'korean', label: '韩国剧' },
      { value: 'japanese', label: '日本剧' },
      { value: 'american', label: '美国剧' },
      { value: 'british', label: '英国剧' },
      { value: 'other', label: '其他剧' }
    ]
  },
  {
    value: 'anime',
    label: '动漫',
    children: [
      { value: 'japanese-anime', label: '日本动漫' },
      { value: 'chinese-anime', label: '国产动漫' },
      { value: 'american-anime', label: '欧美动漫' },
      { value: 'other-anime', label: '其他动漫' }
    ]
  },
  {
    value: 'variety',
    label: '综艺',
    children: [
      { value: 'mainland-variety', label: '大陆综艺' },
      { value: 'hongkong-variety', label: '港台综艺' },
      { value: 'korean-variety', label: '韩国综艺' },
      { value: 'japanese-variety', label: '日本综艺' },
      { value: 'other-variety', label: '其他综艺' }
    ]
  },
  {
    value: 'shorts',
    label: '短剧',
    children: [
      { value: 'romance-short', label: '爱情短剧' },
      { value: 'comedy-short', label: '喜剧短剧' },
      { value: 'suspense-short', label: '悬疑短剧' },
      { value: 'other-short', label: '其他短剧' }
    ]
  }
]

// 获取当前激活的子选项
const activeSubOptions = computed(() => {
  return typeOptions[activeParentIndex.value]?.children || []
})

// 选择父级分类
const selectParentCategory = (index) => {
  activeParentIndex.value = index
}

// 选择子分类
const selectSubCategory = (parentIndex, subItem) => {
  const parentItem = typeOptions[parentIndex]
  
  selectedType.value = [parentItem.value, subItem.value]
  selectedLabel.value = `${parentItem.label} - ${subItem.label}`
  selectedSubValue.value = subItem.value
  popoverVisible.value = false
}

// 清除筛选
const clearFilter = () => {
  selectedType.value = []
  selectedLabel.value = ''
  selectedSubValue.value = ''
  popoverVisible.value = false
}

// 计算历史记录使用百分比
const historyPercentage = computed(() => {
  return Math.min(Math.round((historyStore.getHistory.length / 50) * 100), 100)
})

// 根据使用比例返回不同颜色
const historyProgressColor = computed(() => {
  const percentage = historyPercentage.value
  if (percentage < 70) return '#409EFF'
  if (percentage < 90) return '#E6A23C'
  return '#F56C6C'
})

// 格式化百分比显示
const formatHistoryPercentage = (percentage) => {
  return `${historyStore.getHistory.length}/50`
}

// 所有可用的播放源
const availableSources = [
  { value: 'heimuer_api', label: '黑木耳' },  // 特殊值，用于同时筛选heimuer和api
  { value: 'ikun', label: '爱坤' },
  { value: 'wolong', label: '卧龙' },
  { value: '360', label: '360' },
  { value: 'huawei', label: '华为' },
  { value: 'jisu', label: '急速' },
  { value: 'subo', label: '速播' }
]

// 根据播放源筛选历史记录
const filteredHistory = computed(() => {
  let filtered = historyStore.getHistory;
  
  // 按播放源筛选
  if (sourceFilter.value) {
    // 特殊处理黑木耳（包含api和heimuer两个源）
    if (sourceFilter.value === 'heimuer_api') {
      filtered = filtered.filter(item => 
        item.source === 'api' || item.source === 'heimuer'
      );
    } else {
      filtered = filtered.filter(item => item.source === sourceFilter.value);
    }
  }
  
  // 按类型筛选
  if (selectedType.value && selectedType.value.length > 0) {
    const mainType = selectedType.value[0];
    const subType = selectedType.value.length > 1 ? selectedType.value[1] : null;
    
    if (subType) {
      filtered = filtered.filter(item => {
        // 子类型映射表
        const subTypeMap = {
          // 电视剧子类型
          'mainland': ['国产剧', '大陆', '中国大陆', '内地'],
          'hongkong': ['港台剧', '香港', '台湾'],
          'korean': ['韩剧', '韩国'],
          'japanese': ['日剧', '日本'],
          'american': ['美剧', '美国'],
          'british': ['英剧', '英国'],
          // 电影子类型
          'action': ['动作片', '动作'],
          'comedy': ['喜剧片', '喜剧'],
          'romance': ['爱情片', '爱情'],
          'sci-fi': ['科幻片', '科幻'],
          'horror': ['恐怖片', '恐怖'],
          'drama': ['剧情片', '剧情'],
          'war': ['战争片', '战争'],
          'documentary': ['纪录片', '纪录'],
          // 动漫子类型
          'japanese-anime': ['日本动漫', '日漫'],
          'chinese-anime': ['国产动漫', '国漫'],
          'american-anime': ['欧美动漫'],
          // 综艺子类型
          'mainland-variety': ['大陆综艺'],
          'hongkong-variety': ['港台综艺'],
          'korean-variety': ['韩国综艺'],
          // 短剧子类型
          'romance-short': ['爱情短剧'],
          'comedy-short': ['喜剧短剧'],
          'suspense-short': ['悬疑短剧']
        };
        
        // 检查type字段
        if (item.type && subTypeMap[subType]?.some(keyword => item.type.includes(keyword))) {
          return true;
        }
        
        // 检查area字段
        if (item.area && subTypeMap[subType]?.some(keyword => item.area.includes(keyword))) {
          return true;
        }
        
        return false;
      });
    }
  }
  
  return filtered;
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
// const getTypeLabel = (type) => {
//   const typeMap = {
//     movie: '电影',
//     tv: '电视剧',
//     anime: '动漫',
//     variety: '综艺',
//     shorts: '短剧'
//   }
//   return typeMap[type] || type
// }

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
    'subo': '速播',
    'heimuer': '黑木耳'
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
  margin-bottom: 10px;
}

.history-title {
  margin: 0;
  color: var(--text-color);
  flex-shrink: 0;
  margin-right: auto;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.type-filter-row {
  display: flex;
  margin-bottom: 15px;
}

.clear-btn {
  margin: 0 10px;
}

.source-filter {
  width: 140px;
}

.custom-filter {
  display: flex;
  align-items: center;
}

.current-filter-section {
  margin-bottom: 12px;
  margin-top: 5px;
}

.current-filter {
  font-size: 16px;
  color: var(--text-color-light);
}

.filter-popover-content {
  display: flex;
  height: 300px;
}

.filter-left {
  width: 120px;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
}

.filter-right {
  flex: 1;
  padding: 0 15px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.filter-category {
  padding: 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s;
}

.filter-category:hover, .filter-category.active {
  background-color: #f5f7fa;
  color: #409eff;
}

.filter-subcategory {
  padding: 10px 15px;
  margin: 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.filter-subcategory:hover, .filter-subcategory.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.filter-footer {
  text-align: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.history-limit-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: var(--hover-background);
  border-radius: 8px;
  margin-bottom: 16px;
}

.history-progress {
  flex: 1;
}

.limit-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color-light);
  font-size: 14px;
}

.limit-text .el-icon {
  color: #409EFF;
  font-size: 16px;
  flex-shrink: 0;
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
  /* background-color: var(--el-color-info-light-9); */
  padding: 2px 0px;
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

.source-heimuer {
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

:root[data-theme="dark"] .source-heimuer {
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

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 15px;
  align-items: flex-end;
}

.action-btn {
  width: 36px;
  height: 36px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none;
}

.action-btn:deep(.el-icon) {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.action-btn:hover:deep(.el-icon) {
  transform: scale(1.2);
}

.delete-btn {
  background-color: #F56C6C;
  color: white;
}

/* 暗黑模式样式 */
:root[data-theme="dark"] .action-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:root[data-theme="dark"] .delete-btn {
  background-color: #cf5959;
}

@media (max-width: 768px) {
  .history-page {
    padding: 10px;
  }

  .history-header {
    flex-wrap: nowrap;
    gap: 8px;
  }

  .history {
    font-size: 24px;
    flex-shrink: 0;
  }

  .header-controls {
    flex-shrink: 1;
    gap: 8px;
  }

  .type-filter-row {
    margin-bottom: 12px;
  }

  .clear-btn {
    margin: 0;
    padding: 5px 8px;
  }

  .source-filter {
    width: 100px;
  }

  .filter-popover-content {
    height: 250px;
  }
  
  .filter-left {
    width: 90px;
  }
  
  .filter-subcategory {
    padding: 8px 10px;
    margin: 4px;
    font-size: 14px;
  }
  
  .filter-category {
    padding: 10px 8px;
    font-size: 14px;
  }

  .history-content {
    gap: 12px;
  }

  .history-poster {
    width: 120px;
    height: 160px;
  }

  .meta-info {
    flex-wrap: wrap;
    gap: 8px;
  }

  .actors, .director {
    font-size: 12px;
  }
  
  .history-limit-header {
    padding: 10px;
    margin-bottom: 15px;
  }
  
  .limit-text {
    font-size: 12px;
  }

  .item-actions {
    gap: 6px;
    margin-left: 8px;
  }

  .action-btn {
    width: 30px;
    height: 30px;
  }

  .action-btn:deep(.el-icon) {
    font-size: 16px;
  }
}

/* 全局样式，确保弹窗在移动设备上能正确显示 */
:global(.filter-popover) {
  max-width: 95vw !important;
  max-height: 80vh !important;
  overflow: hidden !important;
}
</style> 