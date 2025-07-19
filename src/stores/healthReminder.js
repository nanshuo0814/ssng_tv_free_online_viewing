import { defineStore } from 'pinia'

// 默认配置
const DEFAULT_SETTINGS = {
  enabled: true, // 是否启用健康提醒
  dailyLimit: 180, // 每日观看时长限制（分钟）
  continuousLimit: 90, // 连续观看时长限制（分钟）
  restDuration: 15, // 建议休息时长（分钟）
  notifyInterval: 30, // 提醒间隔（分钟）
}

export const useHealthReminderStore = defineStore('healthReminder', {
  state: () => ({
    // 健康提醒设置
    settings: { ...DEFAULT_SETTINGS },
    // 当日观看记录
    dailyRecord: {
      totalTime: 0, // 当日总观看时长（分钟）
      continuousTime: 0, // 当前连续观看时长（分钟）
      lastActiveTime: null, // 最后活跃时间
      lastRestTime: null, // 最后休息时间
      reminderShown: false, // 是否已显示提醒
    },
    // 提醒历史
    reminderHistory: [],
  }),

  getters: {
    // 获取今日剩余可观看时长（分钟）
    getRemainingTime: (state) => {
      return Math.max(0, state.settings.dailyLimit - state.dailyRecord.totalTime)
    },
    
    // 获取当前是否需要休息
    getNeedRest: (state) => {
      return state.dailyRecord.continuousTime >= state.settings.continuousLimit
    },
    
    // 获取下次提醒时间
    getNextReminderTime: (state) => {
      if (!state.dailyRecord.lastActiveTime) return null
      const lastActive = new Date(state.dailyRecord.lastActiveTime)
      return new Date(lastActive.getTime() + state.settings.notifyInterval * 60000)
    },
  },

  actions: {
    // 初始化每日记录
    initDailyRecord() {
      const today = new Date().toLocaleDateString()
      const lastDate = this.dailyRecord.lastActiveTime 
        ? new Date(this.dailyRecord.lastActiveTime).toLocaleDateString()
        : null

      // 如果是新的一天，重置记录
      if (lastDate !== today) {
        this.dailyRecord = {
          totalTime: 0,
          continuousTime: 0,
          lastActiveTime: null,
          lastRestTime: null,
          reminderShown: false,
        }
        // 保存昨日记录到历史
        if (lastDate) {
          this.reminderHistory.push({
            date: lastDate,
            totalTime: this.dailyRecord.totalTime,
            restCount: this.reminderHistory.length,
          })
        }
      }
    },

    // 更新观看时长
    updateWatchTime(minutes) {
      this.initDailyRecord()
      
      const now = new Date()
      const lastActive = this.dailyRecord.lastActiveTime 
        ? new Date(this.dailyRecord.lastActiveTime)
        : now

      // 计算时间间隔
      const timeDiff = (now - lastActive) / 60000 // 转换为分钟

      // 如果间隔超过休息时长，重置连续观看时间
      if (timeDiff >= this.settings.restDuration) {
        this.dailyRecord.continuousTime = 0
        this.dailyRecord.lastRestTime = lastActive.toISOString()
      }

      // 更新记录
      this.dailyRecord.totalTime += minutes
      this.dailyRecord.continuousTime += minutes
      this.dailyRecord.lastActiveTime = now.toISOString()
      this.dailyRecord.reminderShown = false
    },

    // 记录休息时间
    recordRest() {
      const now = new Date()
      this.dailyRecord.continuousTime = 0
      this.dailyRecord.lastRestTime = now.toISOString()
      this.dailyRecord.reminderShown = false
    },

    // 更新设置
    updateSettings(newSettings) {
      this.settings = {
        ...this.settings,
        ...newSettings,
      }
    },

    // 重置设置到默认值
    resetSettings() {
      this.settings = { ...DEFAULT_SETTINGS }
    },

    // 重置所有数据（包括历史记录）
    resetAll() {
      this.settings = { ...DEFAULT_SETTINGS }
      this.dailyRecord = {
        totalTime: 0,
        continuousTime: 0,
        lastActiveTime: null,
        lastRestTime: null,
        reminderShown: false,
      }
      this.reminderHistory = []
    },
  },

  persist: {
    key: 'health-reminder',
    storage: localStorage,
    paths: ['settings', 'reminderHistory'] // 只持久化设置和历史记录
  },
}) 