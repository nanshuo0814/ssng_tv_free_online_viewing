<template>
  <div class="play-page">
    <div class="player-container">
      <div class="video-player">
        <img :src="movie.cover" alt="Cover" class="cover-image" v-if="!isPlaying" @click="startPlay">
        <div class="play-button" v-if="!isPlaying" @click="startPlay">
          <el-icon><VideoPlay /></el-icon>
        </div>
        <div v-if="isPlaying" class="video-wrapper">
          <video 
            ref="videoElement" 
            controls 
            autoplay
            class="video-element"
            @ended="handleVideoEnded"
          >
            <source :src="movie.videoUrl" type="video/mp4">
            您的浏览器不支持HTML5视频
          </video>
        </div>
      </div>
    </div>

    <div class="movie-details">
      <div class="movie-info">
        <h1 class="movie-title">{{ movie.title }}</h1>
        <div class="movie-meta">
          <span class="rating">
            <el-rate v-model="movie.score" disabled text-color="#ff9900" :max="5"></el-rate>
            <span>{{ movie.score.toFixed(1) }}</span>
          </span>
          <span class="year">{{ movie.year }}</span>
          <span class="type">{{ movieType }}</span>
          <span class="region">{{ movie.region }}</span>
        </div>
        <div class="movie-description">
          <p>{{ movie.description }}</p>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="addToFavorite">
            <el-icon><Star /></el-icon> 收藏
          </el-button>
          <el-button @click="shareMovie">
            <el-icon><Share /></el-icon> 分享
          </el-button>
        </div>
      </div>

      <div class="episode-list" v-if="movie.episodes && movie.episodes.length > 1">
        <h3>剧集列表</h3>
        <div class="episode-grid">
          <el-button 
            v-for="(episode, index) in movie.episodes" 
            :key="index"
            :type="currentEpisode === index ? 'primary' : ''"
            @click="changeEpisode(index)"
          >
            第{{ index + 1 }}集
          </el-button>
        </div>
      </div>

      <div class="recommendation">
        <h3>相关推荐</h3>
        <div class="movie-grid">
          <div v-for="item in relatedMovies" :key="item.id" class="movie-card">
            <div class="movie-poster">
              <img :src="item.poster" :alt="item.title">
              <div class="movie-overlay">
                <el-button round @click="gotoMovie(item)">
                  <el-icon><VideoPlay /></el-icon> 播放
                </el-button>
              </div>
            </div>
            <div class="movie-info">
              <h3 class="movie-title">{{ item.title }}</h3>
              <p class="movie-score">
                <el-rate 
                  v-model="item.score" 
                  disabled 
                  text-color="#ff9900"
                  :max="5"
                  :score-template="item.score.toFixed(1)"
                ></el-rate>
                <span>{{ item.score.toFixed(1) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHistoryStore } from '@/stores/history'
import { useFavoriteStore } from '@/stores/favorite'
import { ElMessage } from 'element-plus'
import { VideoPlay, Star, Share } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const historyStore = useHistoryStore()
const favoriteStore = useFavoriteStore()
const videoElement = ref(null)
const isPlaying = ref(false)
const currentEpisode = ref(0)

// 模拟获取电影数据
const movie = ref({
  id: '',
  title: '',
  score: 4.5,
  year: '',
  type: '',
  region: '',
  description: '',
  cover: '',
  videoUrl: '',
  episodes: []
})

const relatedMovies = ref([])

const movieType = computed(() => {
  const typeMap = {
    'movie': '电影',
    'tv': '电视剧',
    'anime': '动漫',
    'variety': '综艺'
  }
  return typeMap[movie.value.type] || movie.value.type
})

// 模拟电影数据库
const moviesData = {
  'movie': {
    '1': {
      id: '1',
      title: '这个杀手不太冷',
      score: 4.7,
      year: '1994',
      type: 'movie',
      region: '法国',
      description: '里昂是名孤独的职业杀手，受人雇佣。一天，邻居家小姑娘马蒂尔达敲开他的房门，要求在他那里暂避杀身之祸。原来，隔壁的黑道混混把他们全家都杀了，只有马蒂尔达侥幸逃脱。里昂收留了马蒂尔达，他教小女孩使枪，她教他法文，两人相处融洽。',
      cover: 'https://img2.doubanio.com/view/photo/l/public/p511118051.webp',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    },
    '2': {
      id: '2',
      title: '肖申克的救赎',
      score: 4.8,
      year: '1994',
      type: 'movie',
      region: '美国',
      description: '银行家安迪因涉嫌杀害妻子及其情人而被判无期徒刑，并被送到肖申克监狱服刑。在监狱中，他逐渐与狱友瑞德成为朋友，并凭借自己的金融知识帮助监狱管理层逃税、洗钱，取得了他们的信任和一些特权。',
      cover: 'https://img2.doubanio.com/view/photo/l/public/p480747492.webp',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    }
  },
  'tv': {
    '101': {
      id: '101',
      title: '破产姐妹',
      score: 4.2,
      year: '2011',
      type: 'tv',
      region: '美国',
      description: '富家女卡洛琳的父亲因诈骗入狱，家道中落，被迫与布鲁克林的底层女孩麦克斯合租公寓并在同一家餐厅打工。两个性格迥异的女孩成为了好朋友，并决定一起开蛋糕店创业。',
      cover: 'https://img1.doubanio.com/view/photo/l/public/p2184505167.webp',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      episodes: [
        { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' },
        { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' }
      ]
    }
  },
  'anime': {
    '6': {
      id: '6',
      title: '天空之城',
      score: 4.5,
      year: '1986',
      type: 'anime',
      region: '日本',
      description: '故事讲述了矿业少年巴鲁和神秘少女希达，为了寻找传说中的天空之城拉普达而展开的冒险。拉普达是一座漂浮在空中的岛屿，拥有极为先进的科技和无尽的财富，也是许多人梦寐以求的地方。',
      cover: 'https://img1.doubanio.com/view/photo/l/public/p2554525534.webp',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
    }
  }
}

// 相关推荐数据
const recommendationData = {
  'movie': [
    {
      id: 3,
      title: '霸王别姬',
      score: 4.6,
      poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2561716440.webp',
      type: 'movie'
    },
    {
      id: 4,
      title: '海上钢琴师',
      score: 4.5,
      poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2574551676.webp',
      type: 'movie'
    }
  ],
  'tv': [
    {
      id: 102,
      title: '老友记',
      score: 4.6,
      poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p696162337.webp',
      type: 'tv'
    },
    {
      id: 103,
      title: '请回答1988',
      score: 4.7,
      poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2272563445.webp',
      type: 'tv'
    }
  ],
  'anime': [
    {
      id: 7,
      title: '千与千寻',
      score: 4.7,
      poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2557573348.webp',
      type: 'anime'
    },
    {
      id: 12,
      title: '龙猫',
      score: 4.5,
      poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2540924496.webp',
      type: 'anime'
    }
  ]
}

// 加载电影数据
const loadMovieData = () => {
  const type = route.params.type
  const id = route.params.id
  
  if (moviesData[type] && moviesData[type][id]) {
    movie.value = moviesData[type][id]
    
    // 添加到历史记录
    addToHistory()
    
    // 加载相关推荐
    relatedMovies.value = recommendationData[type] || []
  } else {
    ElMessage.error('找不到影片信息')
    router.push('/')
  }
}

// 添加到历史记录
const addToHistory = () => {
  historyStore.addToHistory({
    id: movie.value.id,
    title: movie.value.title,
    url: `/play/${movie.value.type}/${movie.value.id}`,
    type: movie.value.type
  })
}

const startPlay = () => {
  isPlaying.value = true
}

const handleVideoEnded = () => {
  isPlaying.value = false
  // 如果是剧集，自动播放下一集
  if (movie.value.episodes && movie.value.episodes.length > currentEpisode.value + 1) {
    currentEpisode.value++
    setTimeout(() => {
      isPlaying.value = true
    }, 1000)
  }
}

const changeEpisode = (index) => {
  currentEpisode.value = index
  movie.value.videoUrl = movie.value.episodes[index].url
  isPlaying.value = true
  
  if (videoElement.value) {
    videoElement.value.load()
    videoElement.value.play()
  }
}

const addToFavorite = () => {
  favoriteStore.addFavorite({
    id: movie.value.id,
    title: movie.value.title,
    url: `/play/${movie.value.type}/${movie.value.id}`,
    site: 'SSNG TV',
    type: movie.value.type
  })
  
  ElMessage.success('已添加到收藏')
}

const shareMovie = () => {
  const url = window.location.href
  // 实际项目中可以使用clipboard API或其他分享API
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

const gotoMovie = (item) => {
  router.push(`/play/${item.type}/${item.id}`)
}

// 监听路由变化
watch(() => route.params, () => {
  loadMovieData()
}, { immediate: true })
</script>

<style scoped>
.play-page {
  padding: 0 0 20px;
}

.player-container {
  margin-bottom: 20px;
}

.video-player {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9宽高比 */
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button .el-icon {
  font-size: 40px;
  color: white;
}

.play-button:hover {
  background-color: rgba(255, 96, 0, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

.video-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-element {
  width: 100%;
  height: 100%;
}

.movie-details {
  margin-top: 20px;
}

.movie-title {
  margin: 0 0 10px;
  font-size: 28px;
  color: var(--text-color);
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  color: var(--secondary-color);
}

.rating {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #ff9900;
}

.movie-description {
  margin-bottom: 20px;
  line-height: 1.6;
  color: var(--text-color);
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.episode-list {
  margin-bottom: 30px;
}

.episode-list h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: var(--text-color);
}

.episode-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.recommendation h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: var(--text-color);
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.movie-card {
  background: transparent;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 6px;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.movie-info {
  padding: 10px 0;
}

.movie-title {
  margin: 0 0 5px;
  font-size: 16px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-score {
  display: flex;
  align-items: center;
  color: #ff9900;
  margin: 0;
}

.movie-score span {
  margin-left: 5px;
}

@media (max-width: 768px) {
  .movie-title {
    font-size: 20px;
  }
  
  .movie-meta {
    flex-wrap: wrap;
  }
  
  .play-button {
    width: 60px;
    height: 60px;
  }
  
  .play-button .el-icon {
    font-size: 30px;
  }
}
</style> 