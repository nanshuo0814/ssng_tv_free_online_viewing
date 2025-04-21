<template>
  <div class="video-list">
    <div class="list-header">
      <h2 class="list-title">{{ title }}</h2>
      <div class="list-actions" v-if="showFilter">
        <el-select 
          v-model="selectedCategory" 
          placeholder="选择分类" 
          @change="handleCategoryChange"
          size="small"
        >
          <el-option 
            v-for="category in categories" 
            :key="category.id" 
            :label="category.name" 
            :value="category.id" 
          />
        </el-select>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="error" class="error-container">
      <el-empty 
        description="加载数据失败，请重试" 
        :image-size="100"
      >
        <el-button type="primary" @click="loadData">重新加载</el-button>
      </el-empty>
    </div>
    
    <div v-else-if="videos.length === 0" class="empty-container">
      <el-empty 
        description="没有找到相关视频" 
        :image-size="100"
      />
    </div>
    
    <el-row :gutter="20" v-else class="video-grid">
      <el-col 
        v-for="video in videos" 
        :key="video.vod_id" 
        :xs="12" 
        :sm="8" 
        :md="6" 
        :lg="4" 
        :xl="3"
      >
        <router-link :to="{ name: 'videoDetail', params: { id: video.vod_id } }" class="video-card-link">
          <el-card shadow="hover" class="video-card">
            <div class="video-poster">
              <img 
                :src="video.vod_pic || '/src/assets/default-poster.svg'" 
                :alt="video.vod_name"
                @error="handleImageError"
              />
              <div class="video-remarks" v-if="video.vod_remarks">{{ video.vod_remarks }}</div>
            </div>
            <div class="video-info">
              <h3 class="video-title" :title="video.vod_name">{{ video.vod_name }}</h3>
              <div class="video-meta">
                <span v-if="video.vod_year">{{ video.vod_year }}</span>
                <span v-if="video.vod_area" class="video-area">{{ video.vod_area }}</span>
              </div>
            </div>
          </el-card>
        </router-link>
      </el-col>
    </el-row>
    
    <div class="pagination-container" v-if="totalPages > 1">
      <el-pagination
        v-model:currentPage="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="total"
        @current-change="handlePageChange"
        :hide-on-single-page="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVideoList, getCategories as fetchCategories } from '../services/apiService';

const props = defineProps({
  title: {
    type: String,
    default: '视频列表'
  },
  showFilter: {
    type: Boolean,
    default: true
  },
  categoryId: {
    type: [Number, String],
    default: 0
  },
  keyword: {
    type: String,
    default: ''
  }
});

const route = useRoute();
const router = useRouter();

// 数据状态
const loading = ref(false);
const error = ref(null);
const videos = ref([]);
const categories = ref([]);
const selectedCategory = ref(props.categoryId || 0);
const currentPage = ref(parseInt(route.query.page) || 1);
const pageSize = ref(20);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
  if (newQuery.page) {
    currentPage.value = parseInt(newQuery.page);
  }
  if (newQuery.categoryId) {
    selectedCategory.value = newQuery.categoryId;
  }
}, { immediate: true });

// 处理分类变更
function handleCategoryChange(categoryId) {
  currentPage.value = 1;
  router.push({ 
    query: { 
      ...route.query,
      categoryId,
      page: 1
    } 
  });
  loadData();
}

// 处理页码变更
function handlePageChange(page) {
  router.push({ 
    query: { 
      ...route.query,
      page
    } 
  });
  loadData();
}

// 处理图片加载错误
function handleImageError(e) {
  e.target.src = '/src/assets/default-poster.svg';
}

// 加载分类数据
async function loadCategories() {
  try {
    const categoryData = await fetchCategories();
    if (categoryData && categoryData.length > 0) {
      // 添加"全部"选项
      categories.value = [{ id: 0, name: '全部' }, ...categoryData];
    }
  } catch (err) {
    console.error('加载分类失败', err);
  }
}

// 加载视频数据
async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    const result = await getVideoList(
      currentPage.value,
      pageSize.value,
      selectedCategory.value || props.categoryId,
      props.keyword
    );
    
    if (result && result.code === 1) {
      videos.value = result.list || [];
      total.value = parseInt(result.total) || 0;
    } else {
      throw new Error(result.msg || '获取数据失败');
    }
  } catch (err) {
    error.value = err.message || '加载失败';
    console.error('加载视频列表失败', err);
  } finally {
    loading.value = false;
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData();
  if (props.showFilter) {
    loadCategories();
  }
});
</script>

<style scoped>
.video-list {
  margin-bottom: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-title {
  margin: 0;
  font-size: 20px;
}

.video-grid {
  margin-bottom: 20px;
}

.video-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
  margin-bottom: 20px;
}

.video-card {
  transition: transform 0.3s;
  height: 100%;
}

.video-card:hover {
  transform: translateY(-5px);
}

.video-poster {
  position: relative;
  overflow: hidden;
  height: 0;
  padding-top: 140%; /* 海报比例 */
}

.video-poster img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.video-card:hover .video-poster img {
  transform: scale(1.05);
}

.video-remarks {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
}

.video-info {
  padding: 10px 0;
}

.video-title {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-meta {
  display: flex;
  font-size: 12px;
  color: #999;
}

.video-area {
  margin-left: 8px;
}

.loading-container,
.error-container,
.empty-container {
  padding: 30px 0;
  text-align: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 