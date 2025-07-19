import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isCollapsed: false,
    showFps: true // 永久显示FPS
  }),
  
  actions: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
      localStorage.setItem('sidebar-collapsed', this.isCollapsed ? 'true' : 'false')
    },
    
    collapseSidebar() {
      this.isCollapsed = true
      localStorage.setItem('sidebar-collapsed', 'true')
    },
    
    initSidebar() {
      const savedCollapsedState = localStorage.getItem('sidebar-collapsed')
      if (savedCollapsedState !== null) {
        this.isCollapsed = savedCollapsedState === 'true'
      }
      
      // 始终显示FPS
      this.showFps = true
    }
  }
}) 