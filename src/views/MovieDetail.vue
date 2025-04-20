<template>
  <div class="movie-detail-page">
    <!-- 电影海报背景 -->
    <div class="backdrop-container">
      <div 
        class="backdrop" 
        :style="{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }"
      ></div>
      <div class="backdrop-overlay"></div>
    </div>

    <div class="movie-content">
      <div class="movie-header">
        <!-- 电影海报 -->
        <div class="poster-container">
          <img 
            :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : defaultPoster" 
            :alt="movie.title || movie.name" 
            class="movie-poster"
          />
        </div>

        <!-- 电影信息 -->
        <div class="movie-info">
          <h1 class="movie-title">{{ movie.title || movie.name }}</h1>
          
          <div class="movie-meta">
            <div class="meta-item release-date">
              <i class="el-icon-date"></i>
              <span>{{ formatDate(movie.release_date || movie.first_air_date) }}</span>
            </div>
            
            <div class="meta-item runtime" v-if="movie.runtime || movie.episode_run_time">
              <i class="el-icon-time"></i>
              <span>{{ formatRuntime(movie.runtime || (movie.episode_run_time && movie.episode_run_time[0])) }}</span>
            </div>
            
            <div class="meta-item rating">
              <i class="el-icon-star-on"></i>
              <span>{{ movie.vote_average?.toFixed(1) || '暂无评分' }}</span>
            </div>
          </div>
          
          <div class="genres" v-if="movie.genres?.length">
            <span 
              v-for="genre in movie.genres" 
              :key="genre.id" 
              class="genre-tag"
            >
              {{ genre.name }}
            </span>
          </div>
          
          <div class="movie-tagline" v-if="movie.tagline">
            <q>{{ movie.tagline }}</q>
          </div>
          
          <div class="movie-overview">
            <h3>剧情简介</h3>
            <p>{{ movie.overview || '暂无简介' }}</p>
          </div>
          
          <div class="action-buttons">
            <button class="primary-button" @click="playMovie">
              <i class="el-icon-video-play"></i> 立即播放
            </button>
            <button class="secondary-button" @click="addToFavorites">
              <i class="el-icon-star-off" :class="{ 'is-favorite': movie.is_favorite }"></i> 收藏
            </button>
            <button class="secondary-button" @click="share">
              <i class="el-icon-share"></i> 分享
            </button>
          </div>
        </div>
      </div>

      <!-- 剧集列表 (如果是电视剧) -->
      <div class="tv-seasons" v-if="movie.seasons?.length">
        <h2 class="section-title">剧集列表</h2>
        
        <div class="seasons-tabs">
          <div 
            v-for="season in movie.seasons" 
            :key="season.id"
            class="season-tab"
            :class="{ active: currentSeason === season.season_number }"
            @click="selectSeason(season.season_number)"
          >
            第{{ season.season_number }}季
          </div>
        </div>
        
        <div class="episodes-list" v-if="currentSeasonEpisodes.length">
          <div 
            v-for="episode in currentSeasonEpisodes" 
            :key="episode.id"
            class="episode-item"
            @click="playEpisode(episode)"
          >
            <div class="episode-img">
              <img 
                :src="episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : defaultStill" 
                :alt="episode.name"
              />
              <div class="play-overlay">
                <i class="el-icon-video-play"></i>
              </div>
            </div>
            <div class="episode-info">
              <div class="episode-header">
                <span class="episode-number">第{{ episode.episode_number }}集</span>
                <span class="episode-rating" v-if="episode.vote_average">
                  <i class="el-icon-star-on"></i> {{ episode.vote_average.toFixed(1) }}
                </span>
              </div>
              <h3 class="episode-title">{{ episode.name }}</h3>
              <p class="episode-overview">{{ episode.overview || '暂无简介' }}</p>
            </div>
          </div>
        </div>
        <div v-else class="no-episodes">
          该季暂无可播放剧集
        </div>
      </div>

      <!-- 演员列表 -->
      <div class="cast-section" v-if="movie.credits?.cast?.length">
        <h2 class="section-title">演职人员</h2>
        
        <div class="cast-list">
          <div 
            v-for="person in movie.credits.cast.slice(0, 12)" 
            :key="person.id"
            class="cast-item"
          >
            <div class="cast-image">
              <img 
                :src="person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : defaultProfile" 
                :alt="person.name"
              />
            </div>
            <div class="cast-info">
              <h4 class="cast-name">{{ person.name }}</h4>
              <p class="cast-character">{{ person.character }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 相关视频 -->
      <div class="videos-section" v-if="movie.videos?.results?.length">
        <h2 class="section-title">相关视频</h2>
        
        <div class="videos-list">
          <div 
            v-for="video in movie.videos.results.slice(0, 4)" 
            :key="video.id"
            class="video-item"
            @click="openVideo(video.key)"
          >
            <div class="video-thumbnail">
              <img :src="`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`" :alt="video.name" />
              <div class="play-overlay">
                <i class="el-icon-video-play"></i>
              </div>
            </div>
            <div class="video-info">
              <h4 class="video-title">{{ video.name }}</h4>
              <p class="video-type">{{ videoTypeMap[video.type] || video.type }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 相似推荐 -->
      <div class="similar-section" v-if="movie.similar?.results?.length">
        <h2 class="section-title">相似推荐</h2>
        
        <div class="movie-grid">
          <MovieCard 
            v-for="item in movie.similar.results.slice(0, 6)" 
            :key="item.id" 
            :movie="item" 
            small
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MovieCard from '../components/MovieCard.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 默认图片
const defaultPoster = ref('/src/assets/default-poster.jpg')
const defaultStill = ref('/src/assets/default-still.jpg')
const defaultProfile = ref('/src/assets/default-profile.jpg')

// 视频类型映射
const videoTypeMap = {
  'Trailer': '预告片',
  'Teaser': '先导预告',
  'Clip': '片段',
  'Behind the Scenes': '幕后花絮',
  'Bloopers': '花絮',
  'Featurette': '特辑'
}

// 电影详情
const movie = ref({
  // 示例数据
  id: 1,
  title: '肖申克的救赎',
  name: '',
  poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
  release_date: '1994-09-23',
  first_air_date: null,
  vote_average: 8.7,
  runtime: 142,
  tagline: '希望是件好事，也许是最好的，好东西是不会消亡的。',
  overview: '一场谋杀案使银行家安迪（蒂姆·罗宾斯饰）蒙冤入狱，被判终身监禁。在肖申克监狱的首次现身就让监狱"大哥"瑞德（摩根·弗里曼饰）对他另眼相看。安迪为监狱管理层提供财务方面的帮助，他的能力为他赢得了些许自由和尊重。瑞德帮助他搞到一把石锤和一幅性感女星的海报，安迪在狱中的生活就这样渐渐地改善了。狱友布鲁克斯出狱后不适应外界生活，最终自杀身亡，安迪带领大家思考自己的人生目标和价值。监狱中充斥着各种权力斗争和暴行，安迪却用自己的智慧努力寻求自由。最终，安迪用石锤挖开自己牢房的墙壁，爬过数百米的污水管道逃出监狱，重获自由。瑞德也在安迪的鼓舞下，获释后勇敢地追求自己的人生梦想，两位老朋友最终在海边重逢。',
  genres: [
    { id: 18, name: '剧情' },
    { id: 80, name: '犯罪' }
  ],
  credits: {
    cast: [
      {
        id: 504,
        name: '蒂姆·罗宾斯',
        character: 'Andy Dufresne',
        profile_path: '/7XfQUZdRvIQzKcZLUWehZjxGCVP.jpg'
      },
      {
        id: 192,
        name: '摩根·弗里曼',
        character: 'Ellis Boyd "Red" Redding',
        profile_path: '/iPx4s0JZmPiS3NVgQLfTxnFDXwk.jpg'
      }
    ]
  },
  videos: {
    results: [
      {
        id: '63055b26c74ece007ab9ec36',
        name: '肖申克的救赎 - 预告片',
        key: 'PLl99DlL6b4',
        type: 'Trailer'
      }
    ]
  }
})

// 电视剧季和剧集数据
const currentSeason = ref(1)
const currentSeasonEpisodes = ref([
  {
    id: 111,
    name: '起始',
    episode_number: 1,
    still_path: '/path/to/image.jpg',
    overview: '第一集的简介内容...',
    vote_average: 8.5
  },
  {
    id: 112,
    name: '进展',
    episode_number: 2,
    still_path: '/path/to/image2.jpg',
    overview: '第二集的简介内容...',
    vote_average: 8.2
  }
])

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知日期'
  
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化运行时间
const formatRuntime = (minutes) => {
  if (!minutes) return '未知时长'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}分钟`
  }
  
  return `${hours}小时${mins > 0 ? ` ${mins}分钟` : ''}`
}

// 选择季数
const selectSeason = (seasonNumber) => {
  currentSeason.value = seasonNumber
  // 实际应用中，这里应该从API获取该季的剧集数据
  // fetchSeasonEpisodes(seasonNumber)
}

// 播放电影
const playMovie = () => {
  const mediaType = movie.value.name ? 'tv' : 'movie'
  router.push(`/${mediaType}/${movie.value.id}/play`)
}

// 播放剧集
const playEpisode = (episode) => {
  router.push(`/tv/${movie.value.id}/season/${currentSeason.value}/episode/${episode.episode_number}/play`)
}

// 添加到收藏
const addToFavorites = () => {
  // 实际应用中应调用相应API或状态管理
  ElMessage.success('已添加到收藏')
}

// 分享
const share = () => {
  navigator.clipboard.writeText(window.location.href)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

// 打开视频
const openVideo = (videoKey) => {
  window.open(`https://www.youtube.com/watch?v=${videoKey}`, '_blank')
}

// 获取电影详情
const fetchMovieDetails = () => {
  const id = route.params.id
  const mediaType = route.params.mediaType || 'movie'
  
  // 实际应用中，这里应该调用API获取电影详情
  // fetchMovieData(mediaType, id)
}

onMounted(() => {
  fetchMovieDetails()
})
</script>

<style scoped>
.movie-detail-page {
  position: relative;
  min-height: 100vh;
}

/* 背景图 */
.backdrop-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 500px;
  overflow: hidden;
  z-index: -1;
}

.backdrop {
  width: 100%;
  height: 100%;
  background-position: center top;
  background-size: cover;
  filter: blur(2px);
}

.backdrop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, var(--background-color) 100%);
}

/* 内容区域 */
.movie-content {
  position: relative;
  padding: 30px var(--content-padding) 60px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 电影头部信息 */
.movie-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.poster-container {
  flex-shrink: 0;
  width: 300px;
  height: 450px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-info {
  flex: 1;
  color: white;
}

.movie-title {
  font-size: 2.5rem;
  margin: 0 0 15px;
  font-weight: 700;
}

.movie-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.genre-tag {
  padding: 5px 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.9rem;
}

.movie-tagline {
  font-style: italic;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.movie-overview {
  margin-bottom: 30px;
}

.movie-overview h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.movie-overview p {
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.primary-button, .secondary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
}

.primary-button:hover {
  background-color: var(--primary-color-dark);
}

.secondary-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(5px);
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.is-favorite {
  color: var(--primary-color);
}

/* 季和剧集部分 */
.section-title {
  margin: 40px 0 20px;
  font-size: 1.5rem;
  color: var(--text-color);
}

.seasons-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.season-tab {
  padding: 8px 16px;
  background-color: var(--card-background);
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.season-tab.active {
  background-color: var(--primary-color);
  color: white;
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.episode-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background-color: var(--card-background);
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.episode-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.episode-img {
  position: relative;
  width: 200px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.episode-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.play-overlay i {
  font-size: 40px;
  color: white;
}

.episode-item:hover .play-overlay,
.video-item:hover .play-overlay {
  opacity: 1;
}

.episode-info {
  flex: 1;
}

.episode-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.episode-number {
  font-weight: 500;
  color: var(--text-color-light);
}

.episode-rating {
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 3px;
}

.episode-title {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.episode-overview {
  margin: 0;
  color: var(--text-color-light);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.no-episodes {
  padding: 30px;
  text-align: center;
  background-color: var(--card-background);
  border-radius: 8px;
  color: var(--text-color-light);
}

/* 演员部分 */
.cast-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.cast-item {
  background-color: var(--card-background);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.cast-item:hover {
  transform: translateY(-5px);
}

.cast-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.cast-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cast-info {
  padding: 10px;
}

.cast-name {
  margin: 0 0 5px;
  font-size: 0.9rem;
}

.cast-character {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-color-light);
}

/* 视频部分 */
.videos-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.video-item {
  cursor: pointer;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  padding: 10px 0;
}

.video-title {
  margin: 0 0 5px;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-type {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-color-light);
}

/* 相似推荐部分 */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

@media (max-width: 992px) {
  .movie-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .poster-container {
    width: 200px;
    height: 300px;
    margin: 0 auto;
  }
  
  .movie-title {
    font-size: 2rem;
    margin-top: 10px;
  }
  
  .movie-meta {
    justify-content: center;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .cast-list, .videos-list {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 768px) {
  .backdrop-container {
    height: 400px;
  }
  
  .episode-item {
    flex-direction: column;
  }
  
  .episode-img {
    width: 100%;
    height: 180px;
  }
  
  .videos-list {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
  
  .video-thumbnail {
    height: 200px;
  }
}

@media (max-width: 576px) {
  .movie-content {
    padding: 20px 15px 40px;
  }
  
  .movie-title {
    font-size: 1.5rem;
  }
  
  .movie-meta {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .cast-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .cast-image {
    height: 150px;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style> 