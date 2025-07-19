import { defineStore } from 'pinia'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activityStats: {
      totalVisitTime: 0, // 总访问时长（秒）
      dailyVisitTime: {}, // 每日访问时长 { "2024-03-21": 3600 }
      lastVisit: null, // 最后访问时间
      visitCount: 0, // 访问次数
      weekdayStats: {}, // 每周几的访问时长
      timeSlotStats: {}, // 时段访问统计（0-23小时）
      sessionStartTime: null, // 当前会话开始时间
      isTracking: false, // 是否正在追踪
      pageVisits: {} // 页面访问统计 { "/home": { count: 10, title: "首页" } }
    }
  }),

  getters: {
    getTotalVisitTime: (state) => state.activityStats.totalVisitTime,
    getDailyVisitTime: (state) => state.activityStats.dailyVisitTime,
    getVisitCount: (state) => state.activityStats.visitCount,
    getWeekdayStats: (state) => state.activityStats.weekdayStats,
    getTimeSlotStats: (state) => state.activityStats.timeSlotStats,
    getPageVisits: (state) => {
      // 确保 pageVisits 存在
      if (!state.activityStats.pageVisits) {
        state.activityStats.pageVisits = {}
      }
      
      return Object.entries(state.activityStats.pageVisits)
        .map(([path, data]) => ({
          path,
          ...data
        }))
        .sort((a, b) => b.count - a.count)
    }
  },

  actions: {
    // 初始化统计
    initializeTracking() {
      // 从localStorage加载数据
      const savedStats = localStorage.getItem('activityStats')
      if (savedStats) {
        const parsed = JSON.parse(savedStats)
        // 确保所有必要的字段都存在
        this.activityStats = {
          totalVisitTime: parsed.totalVisitTime || 0,
          dailyVisitTime: parsed.dailyVisitTime || {},
          lastVisit: parsed.lastVisit || null,
          visitCount: parsed.visitCount || 0,
          weekdayStats: parsed.weekdayStats || {},
          timeSlotStats: parsed.timeSlotStats || {},
          sessionStartTime: null,
          isTracking: false,
          pageVisits: parsed.pageVisits || {}
        }
      }
      
      // 开始新的会话
      this.startNewSession()
    },

    // 开始新的会话
    startNewSession() {
      const now = new Date()
      this.activityStats.sessionStartTime = now.getTime()
      this.activityStats.lastVisit = now.toISOString()
      this.activityStats.visitCount++
      this.activityStats.isTracking = true
      
      // 保存数据
      this.saveToLocal()
    },

    // 更新访问时间
    updateVisitTime() {
      if (!this.activityStats.isTracking || !this.activityStats.sessionStartTime) return

      const now = new Date()
      const sessionTime = Math.floor((now.getTime() - this.activityStats.sessionStartTime) / 1000)
      
      // 更新总访问时长
      this.activityStats.totalVisitTime += sessionTime
      
      // 更新每日访问时长
      const today = now.toISOString().split('T')[0]
      this.activityStats.dailyVisitTime[today] = (this.activityStats.dailyVisitTime[today] || 0) + sessionTime
      
      // 更新周几统计
      const weekday = now.getDay()
      this.activityStats.weekdayStats[weekday] = (this.activityStats.weekdayStats[weekday] || 0) + sessionTime
      
      // 更新时段统计
      const hour = now.getHours()
      this.activityStats.timeSlotStats[hour] = (this.activityStats.timeSlotStats[hour] || 0) + sessionTime
      
      // 更新会话开始时间为当前时间
      this.activityStats.sessionStartTime = now.getTime()
      this.activityStats.lastVisit = now.toISOString()
      
      // 保存数据
      this.saveToLocal()
    },

    // 停止追踪
    stopTracking() {
      if (this.activityStats.isTracking) {
        this.updateVisitTime()
        this.activityStats.isTracking = false
        this.activityStats.sessionStartTime = null
        this.saveToLocal()
      }
    },

    // 保存到本地存储
    saveToLocal() {
      localStorage.setItem('activityStats', JSON.stringify(this.activityStats))
    },

    // 记录页面访问
    recordPageVisit(path, title) {
      // 确保 pageVisits 存在
      if (!this.activityStats.pageVisits) {
        this.activityStats.pageVisits = {}
      }

      // 确保路径存在
      if (!path) return

      if (!this.activityStats.pageVisits[path]) {
        this.activityStats.pageVisits[path] = {
          count: 0,
          title: title || path
        }
      }
      this.activityStats.pageVisits[path].count++
      this.saveToLocal()
    },

    // 清除统计数据
    clearStats() {
      this.activityStats = {
        totalVisitTime: 0,
        dailyVisitTime: {},
        lastVisit: null,
        visitCount: 0,
        weekdayStats: {},
        timeSlotStats: {},
        sessionStartTime: null,
        isTracking: false,
        pageVisits: {}
      }
      this.saveToLocal()
    }
  }
}) 