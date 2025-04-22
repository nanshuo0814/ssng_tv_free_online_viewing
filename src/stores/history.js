import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: []
  }),

  actions: {
    addHistory(item) {
      // 检查是否已存在相同的项目
      const index = this.history.findIndex(h => h.id === item.id)
      if (index !== -1) {
        // 如果存在，删除旧的
        this.history.splice(index, 1)
      }
      // 添加到开头
      this.history.unshift({
        ...item,
        timestamp: new Date().toISOString(),
        // 添加更多视频信息
        description: item.description || '', // 视频描述
        actors: item.actors || '', // 主演
        director: item.director || '', // 导演
        year: item.year || '', // 年份
        area: item.area || '', // 地区
        remarks: item.remarks || '', // 备注（更新至第几集等）
        score: item.score || '' // 评分
      })
      
      // 限制历史记录数量为50条
      if (this.history.length > 50) {
        this.history.pop()
      }
      
      // 保存到本地存储
      this.saveToLocal()
      console.log('历史记录已更新:', this.history)
    },

    removeHistory(id) {
      const index = this.history.findIndex(h => h.id === id)
      if (index !== -1) {
        this.history.splice(index, 1)
        this.saveToLocal()
      }
    },

    clearHistory() {
      this.history = []
      this.saveToLocal()
    },

    saveToLocal() {
      try {
        localStorage.setItem('watch-history', JSON.stringify(this.history))
        console.log('历史记录已保存到本地存储')
      } catch (error) {
        console.error('保存历史记录到本地存储失败:', error)
      }
    },

    loadFromLocal() {
      try {
        const saved = localStorage.getItem('watch-history')
        if (saved) {
          this.history = JSON.parse(saved)
          console.log('从本地存储加载历史记录:', this.history)
        }
      } catch (error) {
        console.error('从本地存储加载历史记录失败:', error)
        this.history = []
      }
    }
  },

  getters: {
    getHistory: (state) => state.history,
    
    getRecentHistory: (state) => {
      return state.history.slice(0, 10) // 获取最近10条记录
    }
  }
}) 