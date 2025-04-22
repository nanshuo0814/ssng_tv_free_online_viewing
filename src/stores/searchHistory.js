import { defineStore } from 'pinia'

export const useSearchHistoryStore = defineStore('searchHistory', {
  state: () => ({
    history: []
  }),

  actions: {
    addHistory(keyword) {
      // 如果已存在相同关键词，先删除旧的
      const index = this.history.indexOf(keyword)
      if (index !== -1) {
        this.history.splice(index, 1)
      }
      
      // 添加到开头
      this.history.unshift(keyword)
      
      // 限制历史记录数量为20条
      if (this.history.length > 20) {
        this.history.pop()
      }
      
      // 保存到本地存储
      this.saveToLocal()
    },

    removeHistory(keyword) {
      const index = this.history.indexOf(keyword)
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
        localStorage.setItem('search-history', JSON.stringify(this.history))
      } catch (error) {
        console.error('保存搜索历史失败:', error)
      }
    },

    loadFromLocal() {
      try {
        const saved = localStorage.getItem('search-history')
        if (saved) {
          this.history = JSON.parse(saved)
        }
      } catch (error) {
        console.error('加载搜索历史失败:', error)
        this.history = []
      }
    }
  }
}) 