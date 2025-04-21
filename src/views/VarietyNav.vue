<template>
  <div class="variety-nav">
    <h2 style="margin-bottom: 0px;
  padding: 15px 15px 5px;">综艺</h2>
    <!-- 综艺类型导航栏 -->
    <div class="variety-types">
      <div 
        v-for="type in varietyTypes" 
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

    <!-- 综艺列表 -->
    <div v-else class="variety-grid">
      <div v-for="variety in varieties" :key="variety.vod_id" class="variety-card">
        <router-link :to="`/play/variety/${variety.vod_id}`" class="variety-link">
          <div class="variety-poster">
            <img 
              :src="getImageUrl(variety.vod_pic)" 
              :alt="variety.vod_name"
              @error="handleImageError($event)"
            >
            <!-- 显示标签 -->
            <div v-if="variety.vod_remarks" class="variety-badge">
              {{ variety.vod_remarks }}
            </div>
            
            <!-- 详情悬浮层 -->
            <div class="variety-detail-overlay">
              <h4 class="detail-title">{{ variety.vod_name }}</h4>
              <div v-if="variety.vod_year" class="detail-meta">{{ variety.vod_year }}</div>
              <div v-if="variety.vod_score && variety.vod_score !== '0.0'" class="detail-score">评分: {{ variety.vod_score }}</div>
              <div v-if="variety.vod_actor" class="detail-actors">
                {{ truncateText(variety.vod_actor, 30) }}
              </div>
              <div v-if="variety.vod_blurb || variety.vod_content" class="detail-desc">
                {{ truncateText(variety.vod_blurb || variety.vod_content, 50) }}
              </div>
            </div>
          </div>
          <div class="variety-info">
            <h3 class="variety-title">{{ variety.vod_name }}</h3>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalVarieties"
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

// 综艺类型列表
const varietyTypes = [
  { id: 38, name: '国产综艺' },
  { id: 39, name: '港台综艺' },
  { id: 40, name: '韩国综艺' },
  { id: 41, name: '日本综艺' },
  { id: 42, name: '欧美综艺' },
  { id: 43, name: '新马泰综艺' },
  { id: 44, name: '其它综艺' }
]

// 状态变量
const loading = ref(true)
const varieties = ref([])
const currentPage = ref(1)
const pageSize = ref(24)
const totalVarieties = ref(0)
const currentType = ref(38) // 默认国产综艺

// 加载综艺数据
const fetchVarieties = async () => {
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
        varieties.value = response.data.list
        totalVarieties.value = parseInt(response.data.total) || 0
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
    38: '国产综艺',
    39: '港台综艺',
    40: '韩国综艺',
    41: '日本综艺',
    42: '欧美综艺',
    43: '新马泰综艺',
    44: '其它综艺'
  }
  
  const typeName = typeMap[typeId] || '综艺'
  
  // 根据不同类型生成不同的综艺名称示例
  let varietyNames = [];
  switch(typeId) {
    case 30: // 国产综艺
      varietyNames = ['无限超越班 第三季', '你好星期六', '天赐的声音 第六季', '哈哈哈哈哈 第五季', '半熟恋人 第四季', '千雪汪', '乐在旅途第2季', '盒子里的猫 第一季', '妻子的浪漫旅行 第七季'];
      break;
    case 31: // 港台综艺
      varietyNames = ['综艺玩很大', '全民星攻略', '台湾那么旅行', '小姐不熙娣', '医师好辣', '娱乐百分百', 'WTO姐妹会'];
      break;
    case 32: // 日韩综艺
      varietyNames = ['Running Man', '认识的哥哥', '家师父一体', '恋爱的参考书', '两天一夜', '惊人的星期六', '全知干预视角'];
      break;
    case 33: // 欧美综艺
      varietyNames = ['厨艺大师', '超级歌手', '全美达人秀', '与卡戴珊同行', '真正的厨师', '极速前进', '夜间脱口秀'];
      break;
    default:
      varietyNames = [`${typeName}示例 1`, `${typeName}示例 2`, `${typeName}示例 3`, `${typeName}示例 4`, `${typeName}示例 5`];
  }
  
  // 生成模拟数据
  varieties.value = Array.from({ length: 12 }, (_, i) => {
    const nameIndex = i % varietyNames.length;
    return {
      vod_id: `${typeId}${1000 + i}`,
      vod_name: i < varietyNames.length ? varietyNames[i] : `${typeName}示例 ${i + 1}`,
      vod_pic: 'https://assets.heimuer.tv/imgs/2025/04/21/5a38719da346419b8f55d5d7b6013c86.jpg',
      vod_remarks: '更新至20期',
      vod_year: '2024',
      vod_score: '9.0',
      vod_actor: '主持人1, 主持人2, 嘉宾1, 嘉宾2',
      vod_blurb: `这是一档精彩的${typeName}，笑点不断...`,
      vod_area: typeId === 30 ? '大陆' : (typeId === 31 ? '港台' : (typeId === 32 ? '日韩' : '欧美'))
    };
  });
  
  totalVarieties.value = 24;
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
  fetchVarieties()
}

// 切换综艺类型
const changeType = (typeId) => {
  currentType.value = typeId
  currentPage.value = 1
  fetchVarieties()
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
  fetchVarieties()
})
</script>

<style scoped>
.variety-nav {
  padding: 0 0 20px;
  background-color: var(--card-background);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

/* 综艺类型导航栏 */
.variety-types {
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
  background-color: rgba(255, 87, 34, 0.1);
}

.type-item.active {
  background-color: #ff5722; /* 橙色背景 */
  color: white;
}

/* 加载状态 */
.loading-container {
  padding: 20px;
}

/* 综艺网格 */
.variety-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 0 15px;
}

.variety-card {
  background: transparent;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.variety-card:hover {
  transform: translateY(-5px);
}

.variety-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.variety-poster {
  position: relative;
  height: 250px;
  overflow: hidden;
  border-radius: 6px;
  background-color: var(--hover-background);
}

.variety-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.variety-card:hover .variety-poster img {
  transform: scale(1.05);
}

/* 标签 */
.variety-badge {
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
.variety-detail-overlay {
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

.variety-card:hover .variety-detail-overlay {
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

.variety-info {
  padding: 10px 0;
}

.variety-title {
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
  background-color: #ff5722; /* 橙色背景 */
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
  .variety-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .variety-poster {
    height: 220px;
  }
  
  .type-item {
    padding: 6px 15px;
    font-size: 14px;
  }
}
</style> 