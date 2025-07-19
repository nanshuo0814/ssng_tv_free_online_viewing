import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: []
  }),

  actions: {
    addHistory(item) {
      // 检查路由格式是否为 /play/{id}/{episode}/{source}
      const isPlayRoute = /^\/play\/\d+\/\d+\/\w+$/.test(item.url)
      if (!isPlayRoute) {
        console.log('非播放页面路由，不添加到历史记录')
        return
      }

      // 从URL中提取影片ID和播放源
      const urlParts = item.url.split('/')
      const videoId = urlParts[2]
      const source = urlParts[4]

      // 检查是否已存在相同影片和播放源的记录
      const existingIndex = this.history.findIndex(h => 
        h.id === videoId && h.source === source
      )

      if (existingIndex !== -1) {
        // 如果存在，更新记录
        this.history[existingIndex] = {
          ...this.history[existingIndex],
          ...item,
          timestamp: new Date().toISOString(),
          episode: urlParts[3], // 更新集数
          url: item.url // 更新完整URL
        }
      } else {
        // 如果不存在，添加新记录
        this.history.unshift({
          ...item,
          id: videoId,
          source: source,
          episode: urlParts[3],
          timestamp: new Date().toISOString()
        })
      }
      
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