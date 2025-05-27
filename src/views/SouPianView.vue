<template>
  <div class="guide-container">
    <iframe 
      src="https://soupian.one/"
      frameborder="0" 
      width="100%" 
      height="100%" 
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup>
// 组件逻辑
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

// 设置页面标题
// document.title = '搜片.com - 烁烁南光'

// 可以添加其他逻辑，如页面加载状态、错误处理等
</script>

<style scoped>
.guide-container {
  width: 100%;
  height: calc(100vh - 60px); /* 减去顶部导航栏的高度 */
  overflow: hidden;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

iframe {
  border: none;
  background-color: var(--card-background);
}
</style>
