<template>
  <div class="category">
    <div class="category-header">
      <h2>{{ categoryTitle }}</h2>
      <div class="filter-bar">
        <el-select v-model="filterOrder" placeholder="排序方式" class="filter-select">
          <el-option label="热门排序" value="popular"></el-option>
          <el-option label="评分排序" value="rating"></el-option>
          <el-option label="最新上线" value="newest"></el-option>
        </el-select>
        <el-select v-model="filterRegion" placeholder="地区" class="filter-select">
          <el-option label="全部" value="all"></el-option>
          <el-option label="华语" value="china"></el-option>
          <el-option label="欧美" value="western"></el-option>
          <el-option label="日韩" value="eastasia"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
        <el-select v-model="filterYear" placeholder="年代" class="filter-select">
          <el-option label="全部" value="all"></el-option>
          <el-option label="2023" value="2023"></el-option>
          <el-option label="2022" value="2022"></el-option>
          <el-option label="2021" value="2021"></el-option>
          <el-option label="2020" value="2020"></el-option>
          <el-option label="2019" value="2019"></el-option>
          <el-option label="2010年代" value="2010s"></el-option>
          <el-option label="2000年代" value="2000s"></el-option>
          <el-option label="更早" value="earlier"></el-option>
        </el-select>
      </div>
    </div>

    <div class="movie-grid">
      <div v-for="movie in filteredMovies" :key="movie.id" class="movie-card">
        <div class="movie-poster">
          <img :src="movie.poster" :alt="movie.title">
          <div class="movie-overlay">
            <el-button round @click="playMovie(movie)">
              <el-icon><VideoPlay /></el-icon> 播放
            </el-button>
            <el-button round @click="addToFavorite(movie)">
              <el-icon><Star /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">{{ movie.title }}</h3>
          <p class="movie-score">
            <el-rate 
              v-model="movie.score" 
              disabled 
              text-color="#ff9900"
              :max="5"
              :score-template="movie.score.toFixed(1)"
            ></el-rate>
            <span>{{ movie.score.toFixed(1) }}</span>
          </p>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalMovies"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favorite'
import { ElMessage } from 'element-plus'
import { Star, VideoPlay } from '@element-plus/icons-vue'

const props = defineProps({
  type: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const router = useRouter()
const favoriteStore = useFavoriteStore()

// 筛选条件
const filterOrder = ref('popular')
const filterRegion = ref('all')
const filterYear = ref('all')
const currentPage = ref(1)
const pageSize = ref(24)

// 获取当前分类类型，优先使用props中的type，如果没有则使用路由参数
const currentType = computed(() => props.type || route.params.type)

// 计算分类标题
const categoryTitle = computed(() => {
  const typeMap = {
    movie: '电影',
    tv: '电视剧',
    anime: '动漫',
    variety: '综艺',
    shorts: '短剧'
  }
  return typeMap[currentType.value] || '未知分类'
})

// 模拟电影数据（实际项目应该从API获取）
const allMovies = computed(() => {
  const type = currentType.value
  
  if (type === 'movie') {
    return [
      {
        id: 1,
        title: '这个杀手不太冷',
        score: 4.7,
        poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p511118051.webp',
        type: 'movie',
        region: 'western',
        year: '1994'
      },
      {
        id: 2,
        title: '肖申克的救赎',
        score: 4.8,
        poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p480747492.webp',
        type: 'movie',
        region: 'western',
        year: '1994'
      },
      {
        id: 3,
        title: '霸王别姬',
        score: 4.6,
        poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2561716440.webp',
        type: 'movie',
        region: 'china',
        year: '1993'
      },
      {
        id: 4,
        title: '海上钢琴师',
        score: 4.5,
        poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2574551676.webp',
        type: 'movie',
        region: 'western',
        year: '1998'
      },
      {
        id: 5,
        title: '无间道',
        score: 4.6,
        poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2564556863.webp',
        type: 'movie',
        region: 'china',
        year: '2003'
      },
      {
        id: 8,
        title: '楚门的世界',
        score: 4.6,
        poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p479682972.webp',
        type: 'movie',
        region: 'western',
        year: '1998'
      },
      {
        id: 9,
        title: '大话西游之大圣娶亲',
        score: 4.5,
        poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2455050536.webp',
        type: 'movie',
        region: 'china',
        year: '1995'
      },
      {
        id: 11,
        title: '泰坦尼克号',
        score: 4.4,
        poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p457760035.webp',
        type: 'movie',
        region: 'western',
        year: '1997'
      }
    ]
  } else if (type === 'tv') {
    return [
      {
        id: 101,
        title: '破产姐妹',
        score: 4.2,
        poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2184505167.webp',
        type: 'tv',
        region: 'western',
        year: '2011'
      },
      {
        id: 102,
        title: '老友记',
        score: 4.6,
        poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p696162337.webp',
        type: 'tv',
        region: 'western',
        year: '1994'
      },
      {
        id: 103,
        title: '请回答1988',
        score: 4.7,
        poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2272563445.webp',
        type: 'tv',
        region: 'eastasia',
        year: '2015'
      },
      {
        id: 104,
        title: '权力的游戏',
        score: 4.4,
        poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2554892299.webp',
        type: 'tv',
        region: 'western',
        year: '2011'
      }
    ]
  } else if (type === 'anime') {
    return [
      {
        id: 6,
        title: '天空之城',
        score: 4.5,
        poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2554525534.webp',
        type: 'anime',
        region: 'eastasia',
        year: '1986'
      },
      {
        id: 7,
        title: '千与千寻',
        score: 4.7,
        poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2557573348.webp',
        type: 'anime',
        region: 'eastasia',
        year: '2001'
      },
      {
        id: 10,
        title: '疯狂动物城',
        score: 4.5,
        poster: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2315672647.webp',
        type: 'anime',
        region: 'western',
        year: '2016'
      },
      {
        id: 12,
        title: '龙猫',
        score: 4.5,
        poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2540924496.webp',
        type: 'anime',
        region: 'eastasia',
        year: '1988'
      }
    ]
  } else if (type === 'variety') {
    return [
      {
        id: 201,
        title: '极限挑战',
        score: 4.3,
        poster: 'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2238649383.webp',
        type: 'variety',
        region: 'china',
        year: '2015'
      },
      {
        id: 202,
        title: '奔跑吧兄弟',
        score: 4.1,
        poster: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2195798632.webp',
        type: 'variety',
        region: 'china',
        year: '2014'
      }
    ]
  }
  
  return []
})

// 重置分页和筛选条件
const resetFilters = () => {
  currentPage.value = 1
  filterOrder.value = 'popular'
  filterRegion.value = 'all'
  filterYear.value = 'all'
}

// 监听类型变化，重置相关状态
watch(currentType, () => {
  resetFilters()
}, { immediate: true })

// 筛选电影
const filteredMovies = computed(() => {
  let result = [...allMovies.value]
  
  // 地区筛选
  if (filterRegion.value !== 'all') {
    result = result.filter(movie => movie.region === filterRegion.value)
  }
  
  // 年代筛选
  if (filterYear.value !== 'all') {
    if (filterYear.value === '2010s') {
      result = result.filter(movie => {
        const year = parseInt(movie.year)
        return year >= 2010 && year < 2020
      })
    } else if (filterYear.value === '2000s') {
      result = result.filter(movie => {
        const year = parseInt(movie.year)
        return year >= 2000 && year < 2010
      })
    } else if (filterYear.value === 'earlier') {
      result = result.filter(movie => parseInt(movie.year) < 2000)
    } else {
      result = result.filter(movie => movie.year === filterYear.value)
    }
  }
  
  // 排序
  if (filterOrder.value === 'rating') {
    result.sort((a, b) => b.score - a.score)
  } else if (filterOrder.value === 'newest') {
    result.sort((a, b) => parseInt(b.year) - parseInt(a.year))
  }
  
  return result
})

// 计算总电影数
const totalMovies = computed(() => filteredMovies.value.length)

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
}

const playMovie = (movie) => {
  router.push(`/play/${movie.type}/${movie.id}`)
  ElMessage.success(`正在播放: ${movie.title}`)
}

const addToFavorite = (movie) => {
  favoriteStore.addFavorite({
    id: movie.id.toString(),
    title: movie.title,
    url: `/play/${movie.type}/${movie.id}`,
    site: 'SSNG TV',
    type: movie.type
  })
  ElMessage.success('已添加到收藏')
}
</script>

<style scoped>
.category {
  padding: 0 0 20px;
}

.category-header {
  margin-bottom: 20px;
}

.category-header h2 {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.filter-bar {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.filter-select {
  width: 150px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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
  height: 250px;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 