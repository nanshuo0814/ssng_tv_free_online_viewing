<template>
  <div class="carousel-container">
    <div class="carousel-wrapper">
      <div class="carousel">
        <transition-group name="fade" tag="div" class="carousel-inner">
          <div 
            v-for="(slide, index) in slides" 
            :key="slide.id" 
            v-show="currentIndex === index"
            class="carousel-item"
            @click="navigateTo(slide)"
          >
            <img :src="slide.image" :alt="slide.title" class="carousel-image" />
            <div class="carousel-caption">
              <h2 class="title">{{ slide.title }}</h2>
              <p class="description">{{ slide.description }}</p>
              <div class="play-btn">
                <i class="el-icon-video-play"></i> 立即播放
              </div>
            </div>
          </div>
        </transition-group>
      </div>
      
      <div class="carousel-controls">
        <div class="carousel-indicators">
          <span 
            v-for="(slide, index) in slides" 
            :key="slide.id" 
            :class="['dot', { active: currentIndex === index }]"
            @click="setActiveSlide(index)"
          ></span>
        </div>
        
        <div class="carousel-navigation">
          <button class="prev-btn" @click="prevSlide">
            <i class="el-icon-arrow-left"></i>
          </button>
          <button class="next-btn" @click="nextSlide">
            <i class="el-icon-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  slides: {
    type: Array,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000
  }
})

const router = useRouter()
const currentIndex = ref(0)
let timer = null

// 设置自动播放
const startAutoplay = () => {
  if (props.autoplay && props.slides.length > 1) {
    timer = setInterval(() => {
      nextSlide()
    }, props.interval)
  }
}

// 停止自动播放
const stopAutoplay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 下一张幻灯片
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.slides.length
}

// 上一张幻灯片
const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + props.slides.length) % props.slides.length
}

// 设置当前幻灯片
const setActiveSlide = (index) => {
  currentIndex.value = index
}

// 导航到相应内容
const navigateTo = (slide) => {
  if (slide.link) {
    router.push(slide.link)
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
.carousel-container {
  width: 100%;
}

.carousel-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.carousel {
  position: relative;
}

.carousel-inner {
  position: relative;
  width: 100%;
  height: 500px;
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 100px 60px 60px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  text-align: left;
}

.carousel-caption .title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
}

.carousel-caption .description {
  font-size: 16px;
  margin-bottom: 20px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.play-btn {
  display: inline-flex;
  align-items: center;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.play-btn:hover {
  background: var(--primary-color-dark);
}

.play-btn i {
  margin-right: 8px;
}

.carousel-controls {
  position: absolute;
  bottom: 30px;
  left: 60px;
  right: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.carousel-indicators {
  display: flex;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.3s;
}

.dot.active {
  background: white;
}

.carousel-navigation {
  display: flex;
  gap: 10px;
}

.prev-btn, .next-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.prev-btn:hover, .next-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 