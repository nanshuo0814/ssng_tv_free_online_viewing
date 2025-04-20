<template>
  <div class="movie-list">
    <div class="list-header">
      <h2 class="title">{{ title }}</h2>
      <div class="see-more" @click="$emit('see-more')">
        更多 <i class="el-icon-arrow-right"></i>
      </div>
    </div>
    
    <div class="movie-grid">
      <div 
        v-for="item in data" 
        :key="item.id" 
        class="movie-card"
        @click="navigateToPlay(item.id, item.type)"
      >
        <div class="poster-wrapper">
          <img :src="item.cover" :alt="item.title" class="poster" />
          <div class="overlay">
            <div class="play-icon">
              <i class="el-icon-video-play"></i>
            </div>
          </div>
          <div class="score">{{ item.score }}</div>
          <div v-if="item.episodes" class="episodes">{{ item.episodes }}集</div>
        </div>
        <div class="info">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">{{ item.stars }}</div>
          <div class="item-year">{{ item.year }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(['see-more'])
const router = useRouter()

const navigateToPlay = (id, type) => {
  router.push(`/play/${id}?type=${type || 'movie'}`)
}
</script>

<style scoped>
.movie-list {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.see-more {
  color: var(--primary-color);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.see-more:hover {
  opacity: 0.8;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.movie-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
  overflow: hidden;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.poster-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  height: 260px;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.movie-card:hover .poster {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.movie-card:hover .overlay {
  opacity: 1;
}

.play-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.score {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 204, 0, 0.9);
  color: #000;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.episodes {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.info {
  padding: 10px 0;
}

.item-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta, .item-year {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  margin-bottom: 2px;
}
</style> 