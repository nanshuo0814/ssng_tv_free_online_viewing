import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://www.heimuer.tv',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ikun': {
        target: 'https://ikunzy.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ikun/, '')
      },
      '/subo': {
        target: 'https://www.suboziyuan.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/subo/, '')
      },
      '/huawei': {
        target: 'https://cjhwba.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/huawei/, '')
      },
      '/jisu': {
        target: 'https://www.jisuzy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jisu/, '')
      }
    }
  }
}) 