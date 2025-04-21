<template>
  <div class="api-video-detail-page">
    <VideoDetail :id="id" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import VideoDetail from '@/components/VideoDetail.vue';

const route = useRoute();
const id = ref(route.params.id);

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  id.value = newId;
});

// 组件挂载时设置页面标题
onMounted(() => {
  document.title = 'SSNG TV - 视频详情';
});
</script>

<style scoped>
.api-video-detail-page {
  padding: 20px;
}
</style> 