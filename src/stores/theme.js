import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
    themeColor: 'blue' // 默认主题色为蓝色
  }),
  
  getters: {
    theme: (state) => state.isDark ? 'dark' : 'light'
  },
  
  actions: {
    initTheme() {
      // 初始化深色/浅色模式
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.isDark = savedTheme === 'dark'
      } else {
        // 检查系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.isDark = prefersDark
      }
      
      // 初始化主题色
      const savedColor = localStorage.getItem('theme-color')
      if (savedColor) {
        this.themeColor = savedColor
      }
      
      // 应用主题设置
      this.applyTheme()
    },
    
    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },
    
    setThemeColor(color) {
      this.themeColor = color
      localStorage.setItem('theme-color', color)
      this.applyTheme()
    },
    
    applyTheme() {
      // 设置深色/浅色模式
      document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
      
      // 设置主题色
      document.documentElement.setAttribute('data-color-theme', this.themeColor)
      
      // 移除之前的所有主题色类
      const themeColors = ['blue', 'green', 'purple', 'red', 'orange']
      themeColors.forEach(color => {
        document.documentElement.classList.remove(`theme-${color}`)
      })
      
      // 添加当前主题色类
      document.documentElement.classList.add(`theme-${this.themeColor}`)
    }
  }
}) 