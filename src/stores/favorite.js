import { defineStore } from 'pinia'

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]')
  }),

  actions: {
    addFavorite(item) {
      // 检查是否已存在
      const exists = this.favorites.some(fav => fav.id === item.id)
      
      if (!exists) {
        this.favorites.push({
          ...item,
          added_date: new Date().toISOString()
        })
        
        this.saveToLocalStorage()
      }
    },
    
    removeFavorite(id) {
      this.favorites = this.favorites.filter(item => item.id !== id)
      this.saveToLocalStorage()
    },
    
    clearFavorites() {
      this.favorites = []
      this.saveToLocalStorage()
    },
    
    isFavorite(id) {
      return this.favorites.some(item => item.id === id)
    },
    
    saveToLocalStorage() {
      localStorage.setItem('favorites', JSON.stringify(this.favorites))
    }
  }
}) 