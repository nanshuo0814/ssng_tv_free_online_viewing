<template>
  <rest-lock-screen ref="restLockScreen" />
  <div v-if="healthStore.settings.enabled" class="health-reminder-overlay">
    <el-dialog
      v-model="showReminder"
      title="健康提醒"
      width="360px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="reminder-dialog"
    >
      <div class="reminder-content">
        <el-icon class="reminder-icon" :size="48"><WarningFilled /></el-icon>
        <div class="reminder-text">
          <template v-if="isOverDailyLimit">
            <h3>今日观看时长已达上限</h3>
            <p>为了您的健康，建议今天暂停观看。</p>
          </template>
          <template v-else>
            <h3>该休息一下了</h3>
            <p>您已连续观看{{ formatDuration(healthStore.dailyRecord.continuousTime) }}，已达到连续观看时长限制。</p>
          </template>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="postponeReminder">稍后提醒</el-button>
          <el-button type="primary" @click="startRest">
            开始休息
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHealthReminderStore } from '../stores/healthReminder'
import { WarningFilled } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import RestLockScreen from './RestLockScreen.vue'

const route = useRoute()
const healthStore = useHealthReminderStore()
const showReminder = ref(false)
const restLockScreen = ref(null)

// 计算是否超出每日限制
const isOverDailyLimit = computed(() => {
  return healthStore.dailyRecord.totalTime >= healthStore.settings.dailyLimit
})

// 格式化时长
const formatDuration = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
  }
  return `${minutes}分钟`
}

// 延迟提醒
const postponeReminder = () => {
  showReminder.value = false
  healthStore.dailyRecord.reminderShown = true
}

// 开始休息
const startRest = () => {
  showReminder.value = false
  restLockScreen.value.startRest(healthStore.settings.restDuration)
  // 重置连续观看时间
  healthStore.dailyRecord.continuousTime = 0
  healthStore.dailyRecord.reminderShown = false
  ElNotification({
    title: '休息提醒',
    message: `休息一下，活动活动，${healthStore.settings.restDuration}分钟后继续观看吧！`,
    type: 'success',
    duration: 5000
  })
}

// 检查是否需要显示提醒
const checkReminder = () => {
  if (!healthStore.settings.enabled) return
  
  // 如果已经显示提醒，则不重复提醒
  if (healthStore.dailyRecord.reminderShown) return
  
  // 检查是否需要休息
  if (healthStore.getNeedRest || isOverDailyLimit.value) {
    showReminder.value = true
  }
}

// 定时器
let checkTimer = null

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 如果是在健康提醒页面，不更新观看时间
  if (newPath === '/health-reminder') return
  
  // 重置定时器
  if (checkTimer) {
    clearInterval(checkTimer)
  }
  
  // 启动新的定时器
  checkTimer = setInterval(() => {
    healthStore.updateWatchTime(1) // 更新观看时长
    checkReminder() // 检查是否需要提醒
  }, 60000)
})

onMounted(() => {
  // 如果不是在健康提醒页面，启动定时器
  if (route.path !== '/health-reminder') {
    checkTimer = setInterval(() => {
      healthStore.updateWatchTime(1)
      checkReminder()
    }, 60000)
  }
})

onBeforeUnmount(() => {
  if (checkTimer) {
    clearInterval(checkTimer)
  }
})
</script>

<style scoped>
.health-reminder-overlay {
  position: fixed;
  z-index: 2000;
}

:deep(.el-dialog) {
  z-index: 2001;
}

.reminder-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  text-align: center;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 16px;
}

.reminder-content {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.reminder-icon {
  color: var(--el-color-warning);
  margin-right: 20px;
}

.reminder-text h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: var(--el-color-danger);
}

.reminder-text p {
  margin: 0;
  color: var(--el-text-color-regular);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 