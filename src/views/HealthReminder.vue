<!-- 健康提醒页面 -->
<template>
  <div class="health-reminder-page">
    <div class="page-header">
      <h2>健康提醒</h2>
      <p class="subtitle">关注您的观看健康，合理安排观看时间</p>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>今日观看时长</span>
          </div>
        </template>
        <div class="card-value">
          <span class="number">{{ formatDuration(healthStore.dailyRecord.totalTime) }}</span>
          <div class="progress-info">
            <el-progress 
              :percentage="Math.min(100, (healthStore.dailyRecord.totalTime / healthStore.settings.dailyLimit) * 100)"
              :status="getProgressStatus(healthStore.dailyRecord.totalTime / healthStore.settings.dailyLimit)"
              :format="(percentage) => `${Math.round(percentage)}%`"
              :stroke-width="20"
              :show-text="true"
              text-inside
            />
            <span class="limit-text">每日限制: {{ formatDuration(healthStore.settings.dailyLimit) }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>连续观看时长</span>
          </div>
        </template>
        <div class="card-value">
          <span class="number">{{ formatDuration(healthStore.dailyRecord.continuousTime) }}</span>
          <div class="progress-info">
            <el-progress 
              :percentage="Math.min(100, (healthStore.dailyRecord.continuousTime / healthStore.settings.continuousLimit) * 100)"
              :status="getProgressStatus(healthStore.dailyRecord.continuousTime / healthStore.settings.continuousLimit)"
              :format="(percentage) => `${Math.round(percentage)}%`"
              :stroke-width="20"
              :show-text="true"
              text-inside
            />
            <span class="limit-text">连续观看时长限制: {{ formatDuration(healthStore.settings.continuousLimit) }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>剩余可观看</span>
          </div>
        </template>
        <div class="card-value">
          <span class="number">{{ formatDuration(healthStore.getRemainingTime) }}</span>
          <div class="desc-text">
            {{ healthStore.getRemainingTime > 0 ? '建议合理分配剩余时间' : '建议今日暂停观看' }}
          </div>
        </div>
      </el-card>
    </div>

    <!-- 设置区域 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>健康提醒设置</span>
        </div>
      </template>

      <el-form :model="tempSettings" label-width="140px" class="settings-form">
        <el-form-item label="启用健康提醒">
          <el-switch v-model="tempSettings.enabled" class="settings-switch" />
        </el-form-item>
        
        <el-form-item label="每日观看限制（min）">
          <div class="input-wrapper">
            <el-select
              v-model="tempSettings.dailyLimit"
              class="settings-input"
              allow-create
              filterable
              :placeholder="'选择或输入分钟数（1-480）'"
            >
              <el-option v-for="n in [60, 90, 120, 150, 180]" :key="n" :label="`${n}`" :value="n" />
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item label="连续观看限制（min）">
          <div class="input-wrapper">
            <el-select
              v-model="tempSettings.continuousLimit"
              class="settings-input"
              allow-create
              filterable
              :placeholder="'选择或输入分钟数（1-180）'"
            >
              <el-option v-for="n in [30, 45, 60, 90, 120]" :key="n" :label="`${n}`" :value="n" />
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item label="建议休息时长（min）">
          <div class="input-wrapper">
            <el-select
              v-model="tempSettings.restDuration"
              class="settings-input"
              allow-create
              filterable
              :placeholder="'选择或输入分钟数（1-60）'"
            >
              <el-option v-for="n in [5, 10, 15, 20, 30]" :key="n" :label="`${n}`" :value="n" />
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item label="提醒间隔时长（min）">
          <div class="input-wrapper">
            <el-select
              v-model="tempSettings.notifyInterval"
              class="settings-input"
              allow-create
              filterable
              :placeholder="'选择或输入分钟数（1-120）'"
            >
              <el-option v-for="n in [30, 45, 60, 90, 120]" :key="n" :label="`${n}`" :value="n" />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item class="form-actions">
          <div class="form-buttons">
            <el-button type="primary" class="action-button" @click="saveSettings">保存设置</el-button>
            <el-button type="warning" plain class="action-button" @click="confirmResetSettings">
              <el-icon><RefreshLeft /></el-icon>
              重置默认设置
            </el-button>
            <el-button type="danger" plain class="action-button" @click="confirmResetAll">
              <el-icon><Delete /></el-icon>
              清除所有数据
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提醒弹窗 -->
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
            <p>您已连续观看{{ formatDuration(healthStore.dailyRecord.continuousTime) }}，建议休息{{ formatDuration(healthStore.settings.restDuration) }}。</p>
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
import { ref, computed } from 'vue'
import { useHealthReminderStore } from '../stores/healthReminder'
import { RefreshLeft, Delete, WarningFilled } from '@element-plus/icons-vue'
import { ElNotification, ElMessageBox } from 'element-plus'

const healthStore = useHealthReminderStore()

// 控制弹窗显示
const showReminder = ref(false)

// 临时设置
const tempSettings = ref({ ...healthStore.settings })

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

// 获取进度条状态
const getProgressStatus = (ratio) => {
  if (ratio >= 1) return 'exception'
  if (ratio >= 0.8) return 'warning'
  return 'success'
}

// 延迟提醒
const postponeReminder = () => {
  showReminder.value = false
  healthStore.dailyRecord.reminderShown = true
}

// 开始休息
const startRest = () => {
  showReminder.value = false
  healthStore.recordRest()
  ElNotification({
    title: '休息提醒',
    message: `休息一下，活动活动，${healthStore.settings.restDuration}分钟后继续观看吧！`,
    type: 'success',
    duration: 5000
  })
}

// 保存设置
const saveSettings = () => {
  healthStore.updateSettings(tempSettings.value)
  ElNotification({
    title: '设置已保存',
    message: '健康提醒设置已更新',
    type: 'success'
  })
}

// 确认重置设置
const confirmResetSettings = () => {
  ElMessageBox.confirm(
    '确定要将所有设置重置为默认值吗？此操作不会影响已记录的数据。',
    '重置确认',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    healthStore.resetSettings()
    tempSettings.value = { ...healthStore.settings }
    ElNotification({
      title: '重置成功',
      message: '所有设置已恢复默认值',
      type: 'success',
    })
  }).catch(() => {})
}

// 确认重置所有数据
const confirmResetAll = () => {
  ElMessageBox.confirm(
    '确定要清除所有数据吗？包括设置和历史记录在内的所有数据都将被删除，此操作不可恢复。',
    '重置确认',
    {
      confirmButtonText: '确定清除',
      cancelButtonText: '取消',
      type: 'error',
      draggable: true,
    }
  ).then(() => {
    healthStore.resetAll()
    tempSettings.value = { ...healthStore.settings }
    ElNotification({
      title: '重置成功',
      message: '所有数据已清除',
      type: 'success',
    })
  }).catch(() => {})
}
</script>

<style scoped>
.health-reminder-page {
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  margin-bottom: 12px;
  text-align: center;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 4px 0 0 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.stat-card {
  background-color: var(--el-bg-color);
  margin: 0;
}

.stat-card :deep(.el-card__header) {
  padding: 10px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.card-value {
  padding: 16px;
  text-align: center;
}

.number {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-color-primary);
  display: block;
  margin-bottom: 8px;
}

.progress-info {
  margin-top: 12px;
}

.progress-info :deep(.el-progress-bar__outer) {
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
  height: 26px !important;
}

.progress-info :deep(.el-progress-bar__inner) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

.progress-info :deep(.el-progress__text) {
  font-size: 14px !important;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  margin: 0 5px;
}

.progress-info :deep(.el-progress-bar__innerText) {
  font-size: 14px !important;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.limit-text {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.settings-card {
  background-color: var(--el-bg-color); /* 与stat-card背景色一致 */
  margin: 0;
  max-width: 100%; /* 与stats-cards的grid项最大宽度一致 */
  min-width: 260px; /* 与stat-card最小宽度一致 */
  /* 移除原flex布局，保持与stat-card结构一致 */
}

.settings-card :deep(.el-card__body) {
  padding: 16px; /* 与stat-card的card-value内边距一致 */
  text-align: center; /* 内容居中 */
}

.settings-form {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.input-wrapper {
  width: 180px;
  display: flex;
  align-items: center;
}

.settings-input {
  width: 100%;
}

.settings-input :deep(.el-input-number__decrease),
.settings-input :deep(.el-input-number__increase) {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
  color: var(--el-text-color-regular);
}

.settings-input :deep(.el-input__wrapper) {
  width: 100%;
}

.settings-switch {
  width: 180px;
  display: flex;
  justify-content: flex-start;
}

:deep(.el-form-item__content) {
  justify-content: flex-start !important;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

.form-actions {
  margin-bottom: 0 !important;
  display: flex;
  flex-direction: column;
  /* align-items: flex-end; */
  width: 100%;
}

.form-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.action-button {
  width: 100%;
  margin: 0 !important;
}

@media (max-width: 768px) {
  .health-reminder-page {
    padding: 12px;
    min-height: calc(100vh - 24px);
    gap: 12px;
  }

  .page-header {
    margin-bottom: 8px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .stats-cards {
    gap: 8px;
    margin-bottom: 8px;
  }

  .settings-card :deep(.el-card__body) {
    padding: 16px;
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.el-form-item__label) {
    width: auto;
    min-width: 90px;
  }
}

@media (max-width: 480px) {
  .health-reminder-page {
    padding: 8px;
    min-height: calc(100vh - 16px);
    gap: 8px;
  }

  .settings-card :deep(.el-card__body) {
    padding: 12px;
  }

  :deep(.el-form-item) {
    margin-bottom: 8px;
  }
}

/* 进度条状态颜色 */
:deep(.progress-info .el-progress.is-success .el-progress-bar__inner) {
  background-color: var(--el-color-success);
}

:deep(.progress-info .el-progress.is-warning .el-progress-bar__inner) {
  background-color: var(--el-color-warning);
}

:deep(.progress-info .el-progress.is-exception .el-progress-bar__inner) {
  background-color: var(--el-color-danger);
}
</style>