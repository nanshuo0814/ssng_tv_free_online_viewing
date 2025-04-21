<template>
  <div class="time-display" :title="`当前时间：${currentTime}`">
    <span>{{ currentTime }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 当前时间
const currentTime = ref('')

// 更新当前时间
function updateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 定时器ID
let timeInterval = null

onMounted(() => {
  // 初始化时间
  updateTime()
  // 每秒更新一次时间
  timeInterval = setInterval(updateTime, 1000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.time-display {
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  height: 100%;
  cursor: default;
  min-width: 100px; /* 确保时间组件有足够宽度显示完整时间 */
}

.time-display span {
  font-size: 15px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: visible; /* 确保时间不会被截断 */
}

@media (max-width: 992px) {
  .time-display {
    display: none; /* 在移动端隐藏时间显示 */
  }
}

@media (max-width: 1200px) and (min-width: 993px) {
  /* 调整中等屏幕，确保仍然显示完整时间 */
  .time-display {
    min-width: 100px;
  }
  
  .time-display span {
    font-size: 15px; /* 稍微减小字体以适应较小屏幕 */
    display: inline-block;
    overflow: visible;
    white-space: nowrap;
  }
}
</style> 