<template>
  <div class="home-page">
    <!-- 轮播图部分 -->
    <section class="hero-section">
      <div class="carousel-container">
        <div class="carousel">
          <div 
            v-for="(slide, index) in featuredMovies" 
            :key="slide.id"
            class="carousel-slide"
            :class="{ active: currentSlide === index }"
            :style="{ backgroundImage: `url(https://image.tmdb.org/t/p/original${slide.backdrop_path})` }"
          >
            <div class="slide-content">
              <h1>{{ slide.title || slide.name }}</h1>
              <p class="slide-overview">{{ slide.overview }}</p>
              <div class="slide-buttons">
                <button class="primary-button" @click="playMovie(slide)">
                  <i class="el-icon-video-play"></i> 立即播放
                </button>
                <button class="secondary-button" @click="goToDetails(slide)">
                  <i class="el-icon-info"></i> 详情
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="carousel-indicators">
          <span 
            v-for="(slide, index) in featuredMovies" 
            :key="`indicator-${slide.id}`"
            class="indicator"
            :class="{ active: currentSlide === index }"
            @click="setSlide(index)"
          ></span>
        </div>
        
        <button class="carousel-arrow prev" @click="prevSlide">
          <i class="el-icon-arrow-left"></i>
        </button>
        <button class="carousel-arrow next" @click="nextSlide">
          <i class="el-icon-arrow-right"></i>
        </button>
      </div>
    </section>
    
    <!-- 内容部分 -->
    <section class="content-section">
      <!-- 热门电影 -->
      <div class="movie-section">
        <div class="section-header">
          <h2>热门电影</h2>
          <router-link to="/movies" class="see-all-link">查看全部 <i class="el-icon-arrow-right"></i></router-link>
        </div>
        
        <div class="movie-grid" v-if="popularMovies.length > 0">
          <MovieCard 
            v-for="movie in popularMovies" 
            :key="`movie-${movie.id}`" 
            :movie="movie"
          />
        </div>
        <div v-else class="loading-container">
          <p>加载中...</p>
        </div>
      </div>
      
      <!-- 热门电视剧 -->
      <div class="movie-section">
        <div class="section-header">
          <h2>热门电视剧</h2>
          <router-link to="/tv" class="see-all-link">查看全部 <i class="el-icon-arrow-right"></i></router-link>
        </div>
        
        <div class="movie-grid" v-if="popularTVShows.length > 0">
          <MovieCard 
            v-for="show in popularTVShows" 
            :key="`tv-${show.id}`" 
            :movie="show"
          />
        </div>
        <div v-else class="loading-container">
          <p>加载中...</p>
        </div>
      </div>
      
      <!-- 推荐内容 -->
      <div class="movie-section">
        <div class="section-header">
          <h2>为您推荐</h2>
        </div>
        
        <div class="movie-grid" v-if="recommendedContent.length > 0">
          <MovieCard 
            v-for="item in recommendedContent" 
            :key="`rec-${item.id}`" 
            :movie="item"
          />
        </div>
        <div v-else class="loading-container">
          <p>加载中...</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import MovieCard from '../components/MovieCard.vue'

// 模拟数据 - 实际应用中应该从API获取
const featuredMovies = ref([
  {
    id: 1,
    title: '奥本海默',
    overview: '物理学家J·罗伯特·奥本海默领导曼哈顿计划研发原子弹的故事，揭示了他在二战期间的工作及其后果。',
    backdrop_path: '/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    media_type: 'movie'
  },
  {
    id: 2,
    name: '蓝眼睛',
    overview: '一位妇女在独自生活二十年后与一个陌生人相遇，揭开了一段埋藏已久的复杂过去。',
    backdrop_path: '/oqP1qEZccq5AD9TVTIaO6IGUj7o.jpg',
    media_type: 'tv'
  },
  {
    id: 3,
    title: '沙丘2',
    overview: '保罗·厄崔迪与弗雷曼人联手，踏上复仇之路对抗夺走他家人一切的阴谋者。',
    backdrop_path: '/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg',
    media_type: 'movie'
  }
])

const popularMovies = ref([
  {
    id: 101,
    title: '沙丘2',
    poster_path: '/bVMiMqgGgUVVnQNZa6HnNfQGY9c.jpg',
    vote_average: 8.2,
    release_date: '2024-02-28'
  },
  {
    id: 102,
    title: '猛鬼追魂',
    poster_path: '/nTf3gnuneCXQJN7M6pKJQK1JjZh.jpg',
    vote_average: 7.5,
    release_date: '2024-04-05'
  },
  {
    id: 103,
    title: '灌篮高手',
    poster_path: '/rHyB15bJiZKrN1CzgSc0wKwvEr.jpg',
    vote_average: 7.9,
    release_date: '2023-12-01'
  },
  {
    id: 104,
    title: '奥本海默',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    vote_average: 8.1,
    release_date: '2023-07-21'
  },
  {
    id: 105,
    title: '坠落的审判',
    poster_path: '/6OnoMgGFuZ921eV8v8yEyXoag19.jpg',
    vote_average: 7.1,
    release_date: '2024-01-12'
  }
])

const popularTVShows = ref([
  {
    id: 201,
    name: '绝命毒师',
    poster_path: '/zzVY3Jt3v0TAwpFBJ5daHj3rchX.jpg',
    vote_average: 9.2,
    first_air_date: '2008-01-20'
  },
  {
    id: 202,
    name: '怪奇物语',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    vote_average: 8.6,
    first_air_date: '2016-07-15'
  },
  {
    id: 203,
    name: '黑镜',
    poster_path: '/dNWRUAFFQoYYQllvqJjIFGTDJql.jpg',
    vote_average: 8.3,
    first_air_date: '2011-12-04'
  },
  {
    id: 204,
    name: '权力的游戏',
    poster_path: '/z9gCSwIObDOD2BEtmUwfasar3xs.jpg',
    vote_average: 8.8,
    first_air_date: '2011-04-17'
  },
  {
    id: 205,
    name: '纸钞屋',
    poster_path: '/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
    vote_average: 8.5,
    first_air_date: '2017-05-02'
  }
])

const recommendedContent = ref([
  {
    id: 301,
    title: '星际穿越',
    poster_path: '/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    vote_average: 8.7,
    release_date: '2014-11-07',
    media_type: 'movie'
  },
  {
    id: 302,
    name: '棋魂',
    poster_path: '/rvCvRZl8Uo5sJ09BRzYZ7xVwdoS.jpg',
    vote_average: 8.9,
    first_air_date: '2020-10-10',
    media_type: 'tv'
  },
  {
    id: 303,
    title: '寄生虫',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    vote_average: 8.5,
    release_date: '2019-05-30',
    media_type: 'movie'
  },
  {
    id: 304,
    name: '全职猎人',
    poster_path: '/ucQ3GXKv7TpX8C5a5g5vvHRGUn7.jpg',
    vote_average: 8.6,
    first_air_date: '2011-10-02',
    media_type: 'tv'
  },
  {
    id: 305,
    title: '千与千寻',
    poster_path: '/mSDsSDwaP3E7dEfUPWy4J0djt4O.jpg',
    vote_average: 8.8,
    release_date: '2001-07-20',
    media_type: 'movie'
  }
])

// 轮播图控制
const currentSlide = ref(0)
const slideInterval = ref(null)

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % featuredMovies.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + featuredMovies.value.length) % featuredMovies.value.length
}

const setSlide = (index) => {
  currentSlide.value = index
}

// 路由导航
const router = useRouter()

const playMovie = (movie) => {
  const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie')
  router.push(`/${mediaType}/${movie.id}/play`)
}

const goToDetails = (movie) => {
  const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie')
  router.push(`/${mediaType}/${movie.id}`)
}

// 生命周期钩子
onMounted(() => {
  // 启动轮播图自动切换
  slideInterval.value = setInterval(() => {
    nextSlide()
  }, 5000)
  
  // 实际应用中，这里应该调用API获取数据
  // fetchFeaturedMovies()
  // fetchPopularMovies()
  // fetchPopularTVShows()
  // fetchRecommendedContent()
})

onBeforeUnmount(() => {
  // 清除计时器
  clearInterval(slideInterval.value)
})
</script>

<style scoped>
.home-page {
  width: 100%;
  padding: 0;
}

/* 轮播图样式 */
.hero-section {
  width: 100%;
  margin-bottom: 40px;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 550px;
  overflow: hidden;
}

.carousel {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
}

.carousel-slide.active {
  opacity: 1;
  z-index: 1;
}

.slide-content {
  width: 50%;
  max-width: 600px;
  padding: 0 60px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.slide-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.slide-overview {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-buttons {
  display: flex;
  gap: 1rem;
}

.primary-button, .secondary-button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
}

.primary-button:hover {
  background-color: var(--primary-color-dark);
}

.secondary-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(5px);
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 2;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s;
}

.indicator.active {
  background-color: var(--primary-color);
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background-color 0.3s;
}

.carousel-arrow:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.carousel-arrow.prev {
  left: 20px;
}

.carousel-arrow.next {
  right: 20px;
}

/* 内容区域样式 */
.content-section {
  padding: 0 20px;
}

.movie-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.see-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.2s;
}

.see-all-link:hover {
  color: var(--primary-color-dark);
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-color-light);
}

@media (max-width: 1200px) {
  .carousel-container {
    height: 450px;
  }
  
  .slide-content {
    width: 60%;
  }
  
  .slide-content h1 {
    font-size: 2.5rem;
  }
}

@media (max-width: 992px) {
  .carousel-container {
    height: 380px;
  }
  
  .slide-content {
    width: 70%;
  }
  
  .slide-content h1 {
    font-size: 2rem;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .carousel-container {
    height: 320px;
  }
  
  .slide-content {
    width: 80%;
    padding: 0 30px;
  }
  
  .slide-content h1 {
    font-size: 1.8rem;
  }
  
  .slide-overview {
    font-size: 1rem;
    -webkit-line-clamp: 2;
  }
  
  .primary-button, .secondary-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .carousel-container {
    height: 280px;
  }
  
  .slide-content {
    width: 100%;
    padding: 0 20px;
  }
  
  .slide-content h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .slide-overview {
    margin-bottom: 1rem;
    -webkit-line-clamp: 2;
  }
  
  .carousel-arrow {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
}
</style> 