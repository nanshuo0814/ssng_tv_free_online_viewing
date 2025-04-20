import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isCollapsed: false
  }),
  
  actions: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
      localStorage.setItem('sidebar-collapsed', this.isCollapsed ? 'true' : 'false')
    },
    
    initSidebar() {
      const savedState = localStorage.getItem('sidebar-collapsed')
      if (savedState !== null) {
        this.isCollapsed = savedState === 'true'
      }
    }
  }
}) 