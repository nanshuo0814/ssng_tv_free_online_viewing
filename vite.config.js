import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      // 压缩算法
      algorithm: 'gzip',
      // 压缩文件类型
      ext: '.gz',
      // 是否在控制台输出压缩结果
      verbose: true,
      // 是否删除原始文件
      deleteOriginFile: false,
      // 压缩阈值
      threshold: 10240,
      // 是否启用压缩
      disable: false,
      // 压缩级别
      compressionOptions: {
        level: 9
      }
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      verbose: true,
      deleteOriginFile: false,
      threshold: 10240,
      disable: false,
      compressionOptions: {
        level: 11
      }
    })
  ],
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
      },
      '/360': {
        target: 'https://360zy5.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/360/, '')
      },
      '/wolong': {
        target: 'https://wolongzyw.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wolong/, '')
      }
    }
  }
}) 