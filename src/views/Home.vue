<template>
  <div class="home-page">
    <!-- 单张图片（替换原轮播图） -->
    <div class="banner-section">
      <div class="banner-item" @click="navigateToPlay(bannerList[0].id)">
        <img :src="bannerList[0].cover" alt="banner" />
        <div class="banner-info">
          <div class="banner-title">{{ bannerList[0].title }}</div>
          <div class="banner-desc">{{ bannerList[0].description }}</div>
        </div>
      </div>
    </div>

    <!-- 推荐内容 -->
    <div class="content-section">
      <MovieList 
        title="热门电影" 
        :data="hotMovies" 
        @see-more="seeMore('movie')" 
      />
      
      <MovieList 
        title="热播电视剧" 
        :data="hotTVShows" 
        @see-more="seeMore('tv')" 
      />
      
      <MovieList 
        title="人气动漫" 
        :data="hotAnimes" 
        @see-more="seeMore('anime')" 
      />
      
      <MovieList 
        title="精彩综艺" 
        :data="hotVarieties" 
        @see-more="seeMore('variety')" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MovieList from '@/components/MovieList.vue'

const router = useRouter()

const bannerList = ref([
  {
    id: 1,
    title: '长安三万里',
    description: '盛唐时期，诗人高适遇见了想要游历天下的少年杜甫...',
    cover: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2886376181.jpg'
  },
  {
    id: 2,
    title: '奥本海默',
    description: '二战期间，美国政府启动了曼哈顿计划，物理学家奥本海默被委以重任...',
    cover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2898873708.jpg'
  },
  {
    id: 3,
    title: '狂飙',
    description: '该剧讲述了重案组长安欣，在与黑恶势力斗争的过程中...',
    cover: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2886273542.jpg'
  }
])

const hotMovies = ref([])
const hotTVShows = ref([])
const hotAnimes = ref([])
const hotVarieties = ref([])

// 模拟获取数据
const fetchData = async () => {
  // 实际项目中应该调用API
  // 这里使用模拟数据
  hotMovies.value = generateMockMovies(8)
  hotTVShows.value = generateMockTVShows(8)
  hotAnimes.value = generateMockAnimes(8)
  hotVarieties.value = generateMockVarieties(8)
}

// 生成模拟数据
const generateMockMovies = (count) => {
  const movies = []
  const titles = ['流浪地球2', '满江红', '我和我的祖国', '复仇者联盟4', '星际穿越', '熊出没', '长津湖', '独行月球']
  const stars = ['吴京、刘德华', '沈腾、易烊千玺', '黄渤、张译', '小罗伯特·唐尼', '马修·麦康纳', '张伟、张秋生', '吴京、易烊千玺', '沈腾、马丽']
  
  for (let i = 0; i < count; i++) {
    movies.push({
      id: i + 1,
      title: titles[i],
      cover: `https://pic.imgdb.cn/item/65e1942e9f345e8d03df24${i}c.jpg`,
      score: (Math.random() * 2 + 8).toFixed(1),
      stars: stars[i],
      year: 2020 + Math.floor(Math.random() * 4),
      type: 'movie'
    })
  }
  return movies
}

const generateMockTVShows = (count) => {
  const shows = []
  const titles = ['狂飙', '风起陇西', '三体', '觉醒年代', '大江大河', '隐秘的角落', '庆余年', '人民的名义']
  const stars = ['张艺谋、任宏恩', '陈坤、白宇', '张鲁一、于和伟', '李大华、于和伟', '王凯、杨烁', '秦昊、王景春', '张若昀、李沁', '陆毅、张丰毅']
  
  for (let i = 0; i < count; i++) {
    shows.push({
      id: 100 + i,
      title: titles[i],
      cover: `https://pic.imgdb.cn/item/65e194a09f345e8d03e065${i}c.jpg`,
      score: (Math.random() * 2 + 8).toFixed(1),
      stars: stars[i],
      year: 2020 + Math.floor(Math.random() * 4),
      type: 'tv',
      episodes: Math.floor(Math.random() * 20) + 20
    })
  }
  return shows
}

const generateMockAnimes = (count) => {
  const animes = []
  const titles = ['鬼灭之刃', '咒术回战', '间谍过家家', '刀剑神域', '你的名字', '画江湖之不良人', '镇魂街', '斗罗大陆']
  const stars = ['花江夏树、鬼头明里', '榎木淳弥、内田雄马', '江口拓也、种崎敦美', '松冈祯丞、户松遥', '神木隆之介、上白石萌音', '图特哈蒙、山新', '汪默之、郭盛', '沈磊、程玉珠']
  
  for (let i = 0; i < count; i++) {
    animes.push({
      id: 200 + i,
      title: titles[i],
      cover: `https://pic.imgdb.cn/item/65e194f89f345e8d03e2a3${i}c.jpg`,
      score: (Math.random() * 2 + 8).toFixed(1),
      stars: stars[i],
      year: 2020 + Math.floor(Math.random() * 4),
      type: 'anime',
      episodes: Math.floor(Math.random() * 20) + 10
    })
  }
  return animes
}

const generateMockVarieties = (count) => {
  const varieties = []
  const titles = ['奔跑吧', '王牌对王牌', '向往的生活', '极限挑战', '脱口秀大会', '乘风破浪的姐姐', '歌手', '明星大侦探']
  const stars = ['李晨、Angelababy', '沈腾、贾玲', '黄磊、何炅', '黄渤、孙红雷', '李诞、池子', '张含韵、袁咏琳', '刘欢、那英', '何炅、撒贝宁']
  
  for (let i = 0; i < count; i++) {
    varieties.push({
      id: 300 + i,
      title: titles[i],
      cover: `https://pic.imgdb.cn/item/65e1954d9f345e8d03e459${i}c.jpg`,
      score: (Math.random() * 2 + 8).toFixed(1),
      stars: stars[i],
      year: 2020 + Math.floor(Math.random() * 4),
      type: 'variety',
      episodes: Math.floor(Math.random() * 10) + 5
    })
  }
  return varieties
}

// 跳转到更多页面
const seeMore = (type) => {
  router.push(`/category/${type}`)
}

// 跳转到播放页面
const navigateToPlay = (id) => {
  router.push(`/play/${id}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.home-page {
  width: 100%;
  padding: 20px;
}

.banner-section {
  margin-bottom: 30px;
  height: 400px;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
}

.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.banner-item:hover img {
  transform: scale(1.05);
}

.banner-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: #fff;
}

.banner-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.banner-desc {
  font-size: 16px;
  opacity: 0.9;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
</style> 