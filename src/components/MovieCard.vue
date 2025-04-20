<template>
  <div 
    class="movie-card" 
    :class="{ 'small': small }"
    @click="navigateToDetail"
  >
    <div class="poster-container">
      <img 
        :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : defaultPoster" 
        :alt="movie.title || movie.name" 
        class="movie-poster"
      />
      <div class="movie-overlay">
        <div class="overlay-buttons">
          <button @click.stop="addToFavorites" class="icon-button">
            <i class="el-icon-star-off" :class="{ 'is-favorite': movie.is_favorite }"></i>
          </button>
          <button @click.stop="playMovie" class="play-button">
            <i class="el-icon-video-play"></i>
            <span>播放</span>
          </button>
        </div>
      </div>
      <div class="movie-rating" v-if="movie.vote_average">
        <span>{{ (movie.vote_average * 10).toFixed(0) }}%</span>
      </div>
    </div>
    
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title || movie.name }}</h3>
      <p class="movie-release-date">{{ formatDate(movie.release_date || movie.first_air_date) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  },
  small: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const defaultPoster = ref('/src/assets/default-poster.jpg')

const navigateToDetail = () => {
  const mediaType = props.movie.media_type || (props.movie.first_air_date ? 'tv' : 'movie')
  router.push(`/${mediaType}/${props.movie.id}`)
}

const addToFavorites = (event) => {
  event.stopPropagation()
  // 实际应用中应该调用API或修改状态以添加到收藏
  console.log('添加到收藏:', props.movie.title || props.movie.name)
}

const playMovie = (event) => {
  event.stopPropagation()
  // 实际应用中应该跳转到播放页面
  const mediaType = props.movie.media_type || (props.movie.first_air_date ? 'tv' : 'movie')
  router.push(`/${mediaType}/${props.movie.id}/play`)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知日期'
  
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--card-background);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.poster-container {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster {
  transform: scale(1.05);
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.icon-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.is-favorite {
  color: var(--primary-color);
}

.play-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.play-button:hover {
  background-color: var(--primary-color-dark);
}

.movie-rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
}

.movie-info {
  padding: 12px;
}

.movie-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 5px 0;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-release-date {
  font-size: 12px;
  color: var(--text-color-light);
  margin: 0;
}

/* 小尺寸卡片样式 */
.movie-card.small .movie-title {
  font-size: 14px;
}

.movie-card.small .movie-release-date {
  font-size: 11px;
}

.movie-card.small .play-button {
  padding: 6px 12px;
  font-size: 12px;
}

.movie-card.small .icon-button {
  width: 32px;
  height: 32px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .movie-title {
    font-size: 14px;
  }
  
  .movie-release-date {
    font-size: 11px;
  }
  
  .movie-overlay {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 70%);
  }
}
</style> 