<template>
  <div class="movie-grid-container">
    <div class="section-header" v-if="title">
      <h2 class="section-title">{{ title }}</h2>
      <router-link v-if="moreLink" :to="moreLink" class="see-more">
        查看更多 <i class="el-icon-arrow-right"></i>
      </router-link>
    </div>
    
    <div class="movie-grid" :class="{ 'grid-small': small }">
      <div v-for="movie in movies" :key="movie.id" class="movie-grid-item">
        <MovieCard :movie="movie" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import MovieCard from './MovieCard.vue'

defineProps({
  movies: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  moreLink: {
    type: Object,
    default: null
  },
  small: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.movie-grid-container {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.see-more {
  color: var(--primary-color);
  font-size: 14px;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.see-more i {
  margin-left: 4px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.grid-small {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
  }
  
  .grid-small {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .section-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .grid-small {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }
}
</style> 