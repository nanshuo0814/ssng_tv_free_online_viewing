<template>
  <div class="drama-nav">
    <!-- 短剧类型导航栏 -->
    <div class="drama-types">
      <div 
        v-for="type in dramaTypes" 
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

    <!-- 短剧列表 -->
    <div v-else class="drama-grid">
      <div v-for="drama in dramas" :key="drama.vod_id" class="drama-card">
        <router-link :to="`/play/drama/${drama.vod_id}`" class="drama-link">
          <div class="drama-poster">
            <img 
              :src="getImageUrl(drama.vod_pic)" 
              :alt="drama.vod_name"
              @error="handleImageError($event)"
            >
            <!-- 显示标签 -->
            <div v-if="drama.vod_remarks" class="drama-badge">
              {{ drama.vod_remarks }}
            </div>
            
            <!-- 详情悬浮层 -->
            <div class="drama-detail-overlay">
              <h4 class="detail-title">{{ drama.vod_name }}</h4>
              <div v-if="drama.vod_year" class="detail-meta">{{ drama.vod_year }}</div>
              <div v-if="drama.vod_score && drama.vod_score !== '0.0'" class="detail-score">评分: {{ drama.vod_score }}</div>
              <div v-if="drama.vod_actor" class="detail-actors">
                {{ truncateText(drama.vod_actor, 30) }}
              </div>
              <div v-if="drama.vod_blurb || drama.vod_content" class="detail-desc">
                {{ truncateText(drama.vod_blurb || drama.vod_content, 50) }}
              </div>
            </div>
          </div>
          <div class="drama-info">
            <h3 class="drama-title">{{ drama.vod_name }}</h3>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalDramas"
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

// 短剧类型列表
const dramaTypes = [
  { id: 47, name: '逆袭短剧' },
  { id: 48, name: '古装短剧' },
  { id: 49, name: '虐恋短剧' },
  { id: 50, name: '悬疑短剧' },
  { id: 51, name: '神豪短剧' },
  { id: 52, name: '重生短剧' },
  { id: 53, name: '复仇短剧' },
  { id: 54, name: '穿越短剧' },
  { id: 55, name: '甜宠短剧' },
  { id: 56, name: '强者短剧' },
  { id: 57, name: '萌宝短剧' },
  { id: 58, name: '其它短剧' }
]

// 状态变量
const loading = ref(true)
const dramas = ref([])
const currentPage = ref(1)
const pageSize = ref(24)
const totalDramas = ref(0)
const currentType = ref(47) // 默认逆袭短剧

// 加载短剧数据
const fetchDramas = async () => {
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
        dramas.value = response.data.list
        totalDramas.value = parseInt(response.data.total) || 0
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
    47: '逆袭短剧',
    48: '古装短剧',
    49: '虐恋短剧',
    50: '悬疑短剧',
    51: '神豪短剧',
    52: '重生短剧',
    53: '复仇短剧',
    54: '穿越短剧',
    55: '甜宠短剧',
    56: '强者短剧',
    57: '萌宝短剧',
    58: '其它短剧'
  }
  
  const typeName = typeMap[typeId] || '短剧'
  
  // 根据不同类型生成不同的短剧名称示例
  let dramaNames = [];
  switch(typeId) {
    case 47: // 逆袭短剧
      dramaNames = ['白月光退场真命天女登场', '从倒霉蛋到霸道总裁', '丑女逆袭成女神', '小人物逆袭记', '农村小子逆袭'];
      break;
    case 48: // 古装短剧
      dramaNames = ['长公主的反派女婿', '庶女心计', '王爷的掌心宠', '宫廷秘史', '朝堂风云'];
      break;
    case 50: // 悬疑短剧
      dramaNames = ['夜光破雾是清晨', '大器早成', '探案迷踪', '代号追凶', '人生岔路口'];
      break;
    case 51: // 神豪短剧
      dramaNames = ['败家子富少', '百亿继承人', '神秘富豪', '豪门继承人', '亿万富翁'];
      break;
    case 55: // 甜宠短剧
      dramaNames = ['姐姐！你命呀', '我的霸道总裁', '霸总的小甜妻', '总裁宠上天', '契约婚姻'];
      break;
    default:
      dramaNames = [`${typeName}示例 1`, `${typeName}示例 2`, `${typeName}示例 3`, `${typeName}示例 4`, `${typeName}示例 5`];
  }
  
  // 生成模拟数据
  dramas.value = Array.from({ length: 12 }, (_, i) => {
    const nameIndex = i % dramaNames.length;
    return {
      vod_id: `${typeId}${1000 + i}`,
      vod_name: i < dramaNames.length ? dramaNames[i] : `${typeName}示例 ${i + 1}`,
      vod_pic: 'https://assets.heimuer.tv/imgs/2025/04/21/5a38719da346419b8f55d5d7b6013c86.jpg',
      vod_remarks: '全80集',
      vod_year: '2024',
      vod_score: '8.0',
      vod_actor: '演员1, 演员2, 演员3',
      vod_blurb: `这是一部精彩的${typeName}，剧情扣人心弦...`,
      vod_area: '大陆'
    };
  });
  
  totalDramas.value = 24;
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
  fetchDramas()
}

// 切换短剧类型
const changeType = (typeId) => {
  currentType.value = typeId
  currentPage.value = 1
  fetchDramas()
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
  fetchDramas()
})
</script>

<style scoped>
.drama-nav {
  padding: 0 0 20px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

/* 短剧类型导航栏 */
.drama-types {
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
  background-color: #9c27b0; /* 紫色背景 */
  color: white;
}

/* 加载状态 */
.loading-container {
  padding: 20px;
}

/* 短剧网格 */
.drama-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  padding: 0 15px;
}

.drama-card {
  background: transparent;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.drama-card:hover {
  transform: translateY(-5px);
}

.drama-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.drama-poster {
  position: relative;
  height: 250px;
  overflow: hidden;
  border-radius: 6px;
  background-color: #e0e0e0;
}

.drama-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.drama-card:hover .drama-poster img {
  transform: scale(1.05);
}

/* 标签 */
.drama-badge {
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
.drama-detail-overlay {
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

.drama-card:hover .drama-detail-overlay {
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

.drama-info {
  padding: 10px 0;
}

.drama-title {
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
  .drama-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .drama-poster {
    height: 220px;
  }
  
  .type-item {
    padding: 6px 15px;
    font-size: 14px;
  }
}
</style> 