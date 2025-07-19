<template>
  <!-- <div class="favorites-page"> -->
    <div class="favorites-header">
      <h2>我的收藏</h2>
      <div class="header-buttons" v-if="favoriteStore.favorites.length > 0">
        <!-- 清空收藏按钮 -->
        <el-button 
          type="danger" 
          size="small" 
          style="height: 32px;"
          @click="confirmClear"
        >
          清空收藏
        </el-button>
        
        <!-- 类型筛选按钮 -->
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
    </div>

    <!-- 当前筛选标签显示 -->
    <div class="current-filter-section" v-if="selectedLabel">
      <div class="current-filter">
        当前筛选: <el-tag size="small" closable @close="clearFilter">{{ selectedLabel }}</el-tag>
      </div>
    </div>

    <!-- 收藏数量提示 -->
    <div class="favorite-count-tip" v-if="filteredFavorites.length > 0">
      <el-icon><Star /></el-icon>
      <span>当前共收藏了 </span>
      <span class="count-number">{{ filteredFavorites.length }}</span>
      <span> 部影片</span>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredFavorites.length === 0" class="empty-state">
      <el-empty description="暂无收藏" />
    </div>

    <!-- 收藏列表 -->
    <div v-else class="favorites-list">
      <div v-for="item in filteredFavorites" :key="item.id" class="favorite-item">
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
import { ref, computed, onMounted } from 'vue'
import { useFavoriteStore } from '../stores/favorite'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Star, ArrowDown, ArrowRight } from '@element-plus/icons-vue'

const favoriteStore = useFavoriteStore()
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

// 筛选后的收藏列表
const filteredFavorites = computed(() => {
  const favorites = [...favoriteStore.favorites]
  
  if (!selectedType.value || selectedType.value.length === 0) {
    return favorites
  }
  
  // 主类型和子类型
  const mainType = selectedType.value[0]
  const subType = selectedType.value.length > 1 ? selectedType.value[1] : null
  
  // 如果没有子类型，不进行筛选
  if (!subType) {
    return favorites
  }
  
  return favorites.filter(item => {
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
    }
    
    // 直接检查type是否匹配子类型的中文名称
    if (subTypeMap[subType]?.includes(item.type)) {
      return true;
    }
    
    // 检查area字段
    if (item.area && subTypeMap[subType]?.some(keyword => item.area.includes(keyword))) {
      return true;
    }
    
    // 检查标签、分类等其他字段
    if (item.tags) {
      if (Array.isArray(item.tags)) {
        if (item.tags.some(tag => subTypeMap[subType]?.some(keyword => tag.includes(keyword)))) {
          return true;
        }
      } else if (typeof item.tags === 'string') {
        if (subTypeMap[subType]?.some(keyword => item.tags.includes(keyword))) {
          return true;
        }
      }
    }
    
    if (item.category) {
      if (subTypeMap[subType]?.some(keyword => item.category.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  })
})

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
  checkMobile()
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
  margin-bottom: 10px;
}

.favorites-header h2 {
  margin: 0;
  color: var(--text-color);
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.current-filter-section {
  margin-bottom: 12px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
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

.current-filter {
  font-size: 16px;
  color: var(--text-color-light);
}

.favorite-count-tip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background-color: rgba(230, 162, 60, 0.1);
  border-radius: 4px;
  margin-bottom: 10px;
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
  /* background-color: var(--el-color-info-light-9); */
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
  
  .header-buttons {
    flex-wrap: wrap;
    gap: 8px;
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
}

/* 全局样式，确保弹窗在移动设备上能正确显示 */
:global(.filter-popover) {
  max-width: 95vw !important;
  max-height: 80vh !important;
  overflow: hidden !important;
}
</style> 