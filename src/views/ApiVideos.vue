<template>
  <div class="api-videos-page">
    <div class="page-header">
      <h1 class="page-title">资源站视频</h1>
      <ApiSourceConfig />
    </div>
    
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索视频..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <Icon name="search" :size="18" />
          </el-button>
        </template>
      </el-input>
    </div>
    
    <VideoList
      :title="listTitle"
      :categoryId="categoryId"
      :keyword="keyword"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VideoList from '@/components/VideoList.vue';
import ApiSourceConfig from '@/components/ApiSourceConfig.vue';
import Icon from '@/components/Icon.vue';
import { getApiUrl } from '@/services/apiService';

const route = useRoute();
const router = useRouter();

// 搜索关键词
const searchKeyword = ref('');
const keyword = ref('');
const categoryId = ref(0);

// 列表标题
const listTitle = computed(() => {
  if (keyword.value) {
    return `搜索: ${keyword.value}`;
  } else if (categoryId.value) {
    return '分类视频';
  } else {
    return '全部视频';
  }
});

// 监听路由查询参数变化
watch(() => route.query, (newQuery) => {
  if (newQuery.keyword) {
    keyword.value = newQuery.keyword;
    searchKeyword.value = newQuery.keyword;
  } else {
    keyword.value = '';
  }
  
  if (newQuery.categoryId) {
    categoryId.value = parseInt(newQuery.categoryId) || 0;
  } else {
    categoryId.value = 0;
  }
}, { immediate: true });

// 处理搜索
function handleSearch() {
  router.push({
    path: '/api/videos',
    query: {
      ...route.query,
      keyword: searchKeyword.value,
      page: 1
    }
  });
}

// 页面标题
watch([keyword, categoryId], ([newKeyword, newCategoryId]) => {
  let title = 'SSNG TV - 资源站视频';
  
  if (newKeyword) {
    title = `搜索: ${newKeyword} - ${title}`;
  } else if (newCategoryId) {
    title = `分类视频 - ${title}`;
  }
  
  document.title = title;
});

// 组件挂载时设置默认查询参数
onMounted(() => {
  // 更新页面标题
  document.title = 'SSNG TV - 资源站视频';
  
  // 如果有查询参数，更新状态
  const { keyword: queryKeyword, categoryId: queryCategoryId } = route.query;
  
  if (queryKeyword) {
    keyword.value = queryKeyword;
    searchKeyword.value = queryKeyword;
  }
  
  if (queryCategoryId) {
    categoryId.value = parseInt(queryCategoryId) || 0;
  }
});
</script>

<style scoped>
.api-videos-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  margin: 0;
}

.search-section {
  margin-bottom: 30px;
}

.search-input {
  max-width: 500px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-title {
    margin-bottom: 15px;
  }
}
</style> 