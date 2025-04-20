<template>
  <div v-if="showFps" class="fps-counter" :class="{ 'sidebar-collapsed': isCollapsed }" :style="{ color: fpsColor }">
    {{ fps }} FPS
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useSidebarStore } from '../stores/sidebar'

const fps = ref(0)
const sidebarStore = useSidebarStore()
const isCollapsed = computed(() => sidebarStore.isCollapsed)
const showFps = computed(() => sidebarStore.showFps)

// 根据帧率返回不同颜色
const fpsColor = computed(() => {
  if (fps.value >= 50) {
    return '#4caf50' // 绿色 - 良好性能
  } else if (fps.value >= 30) {
    return '#ff9800' // 橙色 - 中等性能
  } else {
    return '#f44336' // 红色 - 性能较差
  }
})

let frameCount = 0
let lastTime = performance.now()
let animationFrameId = null

function updateFPS() {
  frameCount++
  const now = performance.now()
  const delta = now - lastTime
  
  if (delta >= 1000) {
    fps.value = Math.round((frameCount * 1000) / delta)
    frameCount = 0
    lastTime = now
  }
  
  animationFrameId = requestAnimationFrame(updateFPS)
}

function startFpsCounter() {
  if (!animationFrameId && showFps.value) {
    animationFrameId = requestAnimationFrame(updateFPS)
  }
}

function stopFpsCounter() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

watch(showFps, (newValue) => {
  if (newValue) {
    startFpsCounter()
  } else {
    stopFpsCounter()
  }
})

onMounted(() => {
  if (showFps.value) {
    startFpsCounter()
  }
})

onUnmounted(() => {
  stopFpsCounter()
})
</script>

<style scoped>
.fps-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  background-color: var(--background-color);
  font-family: monospace;
  border: 1px solid var(--border-color);
  font-weight: bold;
  transition: color 0.3s ease, font-size 0.3s ease, padding 0.3s ease;
}

.sidebar-collapsed {
  font-size: 10px;
  padding: 2px 4px;
  white-space: nowrap;
}

@media (max-width: 992px) {
  .fps-counter {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    padding: 2px 4px;
    z-index: 5;
    background-color: var(--card-background);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style> 