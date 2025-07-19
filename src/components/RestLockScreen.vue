<template>
  <div v-if="isResting" class="rest-lock-screen">
    <div class="rest-content">
      <div class="rest-icon">
        <el-icon :size="64"><Timer /></el-icon>
      </div>
      <h2>休息时间</h2>
      <div class="countdown">
        {{ formatTime(remainingTime) }}
      </div>
      <p class="rest-tip">建议您站起来活动一下，让眼睛休息片刻</p>
      <div class="rest-actions">
        <el-button type="primary" @click="handleSkipRest" plain>跳过休息</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { Timer } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { useHealthReminderStore } from '../stores/healthReminder'

const healthStore = useHealthReminderStore()
const isResting = ref(false)
const remainingTime = ref(0)
let countdownTimer = null

// 格式化时间
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 结束休息
const finishRest = () => {
  isResting.value = false
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  // 恢复页面滚动
  document.body.style.overflow = ''
  // 重置状态
  healthStore.dailyRecord.reminderShown = false
  healthStore.dailyRecord.continuousTime = 0
}

// 处理跳过休息
const handleSkipRest = () => {
  finishRest()
  ElNotification({
    title: '已跳过休息',
    message: '记得注意休息哦！',
    type: 'warning',
    duration: 3000
  })
}

// 开始休息
const startRest = (duration) => {
  isResting.value = true
  remainingTime.value = duration * 60 // 转换为秒

  countdownTimer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      finishRest()
      ElNotification({
        title: '休息结束',
        message: '休息时间已结束，继续愉快地观看吧！',
        type: 'success',
        duration: 3000
      })
    }
  }, 1000)

  // 禁用页面滚动
  document.body.style.overflow = 'hidden'
}

// 暴露方法给父组件
defineExpose({
  startRest
})

onBeforeUnmount(() => {
  finishRest()
})
</script>

<style scoped>
.rest-lock-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--el-bg-color);
  z-index: 2999;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

.rest-content {
  text-align: center;
  padding: 40px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  background-color: var(--el-bg-color-overlay);
  box-shadow: var(--el-box-shadow-light);
}

.rest-icon {
  color: var(--el-color-primary);
  margin-bottom: 20px;
}

.countdown {
  font-size: 48px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin: 24px 0;
  font-family: monospace;
}

.rest-tip {
  color: var(--el-text-color-secondary);
  margin-bottom: 24px;
  font-size: 14px;
}

.rest-actions {
  margin-top: 32px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .rest-content {
    padding: 24px;
  }

  .countdown {
    font-size: 36px;
  }
}
</style> 