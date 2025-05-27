import { defineStore } from 'pinia'

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    favorites: []
  }),

  actions: {
    addFavorite(item) {
      // 检查是否已存在
      const index = this.favorites.findIndex(f => f.id === item.id)
      if (index !== -1) {
        return false // 已经收藏过了
      }
      
      // 添加到收藏
      this.favorites.unshift({
        ...item,
        timestamp: new Date().toISOString()
      })
      
      // 保存到本地存储
      this.saveToLocal()
      return true
    },

    removeFavorite(id) {
      const index = this.favorites.findIndex(f => f.id === id)
      if (index !== -1) {
        this.favorites.splice(index, 1)
        this.saveToLocal()
        return true
      }
      return false
    },

    clearFavorites() {
      this.favorites = []
      this.saveToLocal()
    },

    saveToLocal() {
      try {
        localStorage.setItem('favorites', JSON.stringify(this.favorites))
      } catch (error) {
        console.error('保存收藏到本地存储失败:', error)
      }
    },

    loadFromLocal() {
      try {
        const saved = localStorage.getItem('favorites')
        if (saved) {
          this.favorites = JSON.parse(saved)
        }
      } catch (error) {
        console.error('从本地存储加载收藏失败:', error)
        this.favorites = []
      }
    },

    // 检查是否已收藏
    isFavorited(id) {
      return this.favorites.some(f => f.id === id)
    }
  }
}) 