<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p>您访问的页面不存在或已被移除</p>
      <button class="back-button" @click="goBack">
        <i class="el-icon-back"></i> 返回上一页
      </button>
      <button class="home-button" @click="goHome">
        <i class="el-icon-house"></i> 返回首页
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  text-align: center;
  padding: 20px;
}

.content {
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 32px;
  margin-bottom: 15px;
  color: var(--text-color);
}

p {
  font-size: 18px;
  margin-bottom: 30px;
  color: var(--text-color-light);
}

.back-button, .home-button {
  padding: 12px 24px;
  margin: 0 10px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.2s;
}

.back-button {
  background-color: var(--card-background);
  color: var(--text-color);
}

.back-button:hover {
  background-color: var(--hover-background);
}

.home-button {
  background-color: var(--primary-color);
  color: white;
}

.home-button:hover {
  background-color: var(--primary-color-dark);
}

i {
  margin-right: 8px;
}

@media (max-width: 576px) {
  .error-code {
    font-size: 80px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  p {
    font-size: 16px;
  }
  
  .back-button, .home-button {
    display: block;
    width: 100%;
    margin: 10px 0;
  }
}
</style> 