import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: JSON.parse(localStorage.getItem('watchHistory') || '[]')
  }),

  actions: {
    addToHistory(item) {
      // 检查是否已存在
      const index = this.history.findIndex(record => record.id === item.id)
      
      // 如果已存在，先删除旧记录
      if (index > -1) {
        this.history.splice(index, 1)
      }
      
      // 添加到历史记录的最前面
      this.history.unshift({
        ...item,
        timestamp: new Date().toISOString()
      })
      
      // 限制历史记录数量
      if (this.history.length > 100) {
        this.history = this.history.slice(0, 100)
      }
      
      this.saveToLocalStorage()
    },
    
    clearHistory() {
      this.history = []
      this.saveToLocalStorage()
    },
    
    removeFromHistory(id) {
      this.history = this.history.filter(item => item.id !== id)
      this.saveToLocalStorage()
    },
    
    saveToLocalStorage() {
      localStorage.setItem('watchHistory', JSON.stringify(this.history))
    }
  }
}) 