<template>
  <div class="message-board" :class="{ 'dark-mode': isDarkMode }">
    <div class="notice-banner">
      <div class="notice-content">
        <i class="notice-icon">📢</i>
        <div class="notice-text">
          <h3>温馨提示</h3>
          <p>欢迎留下您的宝贵意见！请文明发言，共同维护良好的交流环境。</p>
        </div>
      </div>
    </div>
    <div class="comment-section">
      <div id="twikoo"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.theme === 'dark')

// 初始化 Twikoo
const initTwikoo = async () => {
  try {
    await window.twikoo.init({
      envId: 'https://tvtwikoo.nanshuo.icu/',
      el: '#twikoo',
    })
  } catch (error) {
    console.error('初始化 Twikoo 失败：', error)
  }
}

// 加载 Twikoo 脚本
const loadTwikooScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.21/dist/twikoo.all.min.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  try {
    await loadTwikooScript()
    await initTwikoo()
  } catch (error) {
    console.error('初始化失败：', error)
  }
})
</script>

<style scoped>
.message-board {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
}

.notice-banner {
  background: var(--background-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--theme-color);
}

.notice-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.notice-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notice-text {
  flex: 1;
}

.notice-text h3 {
  margin: 0 0 8px 0;
  color: var(--theme-color);
  font-size: 18px;
}

.notice-text p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.comment-section {
  flex: 1;
  background: var(--background-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 自定义 Twikoo 样式 */
:deep(#twikoo) {
  --tk-color-primary: var(--theme-color);
  --tk-font-size: 16px;
  max-width: 100%;
  margin: 0 auto;
}

:deep(.tk-comments) {
  margin-top: 0;
}

:deep(.tk-input) {
  background-color: var(--background-color);
}

:deep(.tk-content) {
  background-color: var(--background-color-secondary, #f5f7fa);
}

/* 暗黑模式样式适配 */
.dark-mode {
  :deep(#twikoo) {
    --tk-color-primary: var(--theme-color);
    --tk-text-color: rgba(255, 255, 255, 0.9);
    --tk-color-888: rgba(255, 255, 255, 0.6);
    --tk-color-666: rgba(255, 255, 255, 0.8);
    --tk-color-999: rgba(255, 255, 255, 0.4);
    --tk-color-border: rgba(255, 255, 255, 0.1);
    --tk-color-bg: var(--background-color);
    --tk-color-bg-secondary: var(--background-color-secondary, #1a1a1a);
    --tk-color-bg-transparent: rgba(255, 255, 255, 0.1);
  }

  :deep(.tk-content),
  :deep(.tk-input),
  :deep(.tk-action-btn),
  :deep(.tk-meta-input),
  :deep(.tk-row-actions) {
    background-color: var(--background-color-secondary, #1a1a1a) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  :deep(.tk-comments-title),
  :deep(.tk-comment-content),
  :deep(.tk-nick),
  :deep(.tk-time),
  :deep(.tk-text-nickname),
  :deep(.tk-submit-text) {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  :deep(.tk-icon) {
    fill: rgba(255, 255, 255, 0.6) !important;
  }

  :deep(.tk-action-btn:hover),
  :deep(.tk-meta-input:hover),
  :deep(.tk-meta-input:focus) {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }

  .notice-banner {
    background: var(--background-color-secondary, #1a1a1a);
  }
}

@media (max-width: 768px) {
  .message-board {
    padding: 10px;
  }
}
</style>