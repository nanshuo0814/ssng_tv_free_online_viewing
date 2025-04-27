<template>
  <div class="video-detail">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="error" class="error-container">
      <el-empty 
        description="加载数据失败，请重试" 
        :image-size="100"
      >
        <el-button type="primary" @click="loadVideoDetail">重新加载</el-button>
      </el-empty>
    </div>
    
    <div v-else-if="!videoInfo" class="empty-container">
      <el-empty 
        description="未找到视频信息" 
        :image-size="100"
      />
    </div>
    
    <div v-else class="video-detail-content">
      <div class="video-info-section">
        <div class="video-poster">
          <img 
            :src="videoInfo.vod_pic || '/src/assets/default-poster.svg'" 
            :alt="videoInfo.vod_name"
            @error="handleImageError"
          />
        </div>
        
        <div class="video-info">
          <h1 class="video-title">{{ videoInfo.vod_name }}</h1>
          
          <div class="video-meta">
            <div class="meta-item" v-if="videoInfo.vod_year">
              <span class="meta-label">年份：</span>
              <span>{{ videoInfo.vod_year }}</span>
            </div>
            
            <div class="meta-item" v-if="videoInfo.vod_area">
              <span class="meta-label">地区：</span>
              <span>{{ videoInfo.vod_area }}</span>
            </div>
            
            <div class="meta-item" v-if="videoInfo.vod_lang">
              <span class="meta-label">语言：</span>
              <span>{{ videoInfo.vod_lang }}</span>
            </div>
            
            <div class="meta-item" v-if="videoInfo.vod_remarks">
              <span class="meta-label">备注：</span>
              <span>{{ videoInfo.vod_remarks }}</span>
            </div>
            
            <div class="meta-item" v-if="videoInfo.type_name">
              <span class="meta-label">分类：</span>
              <span>{{ videoInfo.type_name }}</span>
            </div>
          </div>
          
          <div class="video-cast" v-if="videoInfo.vod_actor">
            <div class="meta-label">主演：</div>
            <div class="cast-list">{{ videoInfo.vod_actor }}</div>
          </div>
          
          <div class="video-director" v-if="videoInfo.vod_director">
            <div class="meta-label">导演：</div>
            <div>{{ videoInfo.vod_director }}</div>
          </div>
          
          <div class="video-update-time" v-if="videoInfo.vod_time">
            <div class="meta-label">更新：</div>
            <div>{{ formatDate(videoInfo.vod_time) }}</div>
          </div>
        </div>
      </div>
      
      <div class="video-play-section">
        <div class="section-title">播放列表</div>
        
        <div v-if="playLists.length === 0" class="no-play-list">
          暂无播放资源
        </div>
        
        <div v-else class="play-tabs">
          <el-tabs v-model="activePlaySource" type="card">
            <el-tab-pane 
              v-for="(playList, index) in playLists" 
              :key="index"
              :label="playList.source"
              :name="playList.source"
            >
              <div class="episode-list">
                <el-button
                  v-for="episode in playList.episodes"
                  :key="episode.url"
                  :class="{ 'is-active': activeEpisode === episode.url }"
                  @click="playEpisode(playList.source, episode.url)"
                  size="small"
                >
                  {{ episode.name }}
                </el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      
      <div class="video-player-section" v-if="currentPlayUrl">
        <div class="player-container">
          <iframe 
            :src="playerUrl" 
            frameborder="0" 
            allowfullscreen
            class="video-frame"
          ></iframe>
        </div>
      </div>
      
      <div class="video-description" v-if="videoInfo.vod_content">
        <div class="section-title">剧情简介</div>
        <div class="description-content" v-html="formatContent(videoInfo.vod_content)"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVideoDetail } from '../services/apiService';

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
});

const route = useRoute();
const router = useRouter();

// 数据状态
const loading = ref(false);
const error = ref(null);
const videoInfo = ref(null);
const activePlaySource = ref('');
const activeEpisode = ref('');
const currentPlayUrl = ref('');

// 播放列表
const playLists = computed(() => {
  if (!videoInfo.value || !videoInfo.value.vod_play_from || !videoInfo.value.vod_play_url) {
    return [];
  }
  
  const sources = videoInfo.value.vod_play_from.split(',');
  const urls = videoInfo.value.vod_play_url.split(',');
  
  return sources.map((source, index) => {
    const urlList = urls[index] ? urls[index].split('#') : [];
    
    return {
      source,
      episodes: urlList.map(item => {
        const parts = item.split('$');
        return {
          name: parts[0] || `第${index + 1}集`,
          url: parts[1] || ''
        };
      }).filter(episode => episode.url)
    };
  }).filter(playList => playList.episodes.length > 0);
});

// 播放器URL
const playerUrl = computed(() => {
  // 视频播放地址
  if (!currentPlayUrl.value) return '';
  
  // 构建基本URL参数
  let url = `/player.html?url=${encodeURIComponent(currentPlayUrl.value)}&title=${encodeURIComponent(videoInfo.value ? videoInfo.value.vod_name : '')}`;
  
  // 如果存在字幕数据，添加到URL参数中
  if (videoInfo.value && videoInfo.value.vod_subtitle) {
    url += `&subtitle=${encodeURIComponent(videoInfo.value.vod_subtitle)}`;
  }
  
  return url;
});

// 加载视频详情
async function loadVideoDetail() {
  loading.value = true;
  error.value = null;
  
  try {
    const result = await getVideoDetail(props.id);
    
    if (result && result.code === 1 && result.list && result.list.length > 0) {
      videoInfo.value = result.list[0];
      
      // 自动选择第一个播放源和第一集
      if (playLists.value.length > 0) {
        activePlaySource.value = playLists.value[0].source;
        
        if (playLists.value[0].episodes.length > 0) {
          const firstEpisode = playLists.value[0].episodes[0];
          activeEpisode.value = firstEpisode.url;
          currentPlayUrl.value = firstEpisode.url;
        }
      }
    } else {
      throw new Error(result.msg || '获取视频详情失败');
    }
  } catch (err) {
    error.value = err.message || '加载失败';
    console.error('加载视频详情失败', err);
  } finally {
    loading.value = false;
  }
}

// 播放指定剧集
function playEpisode(source, url) {
  activePlaySource.value = source;
  activeEpisode.value = url;
  currentPlayUrl.value = url;
  
  // 滚动到播放器
  setTimeout(() => {
    const playerSection = document.querySelector('.video-player-section');
    if (playerSection) {
      playerSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}

// 格式化内容
function formatContent(content) {
  if (!content) return '';
  
  // 替换换行符为<br>
  return content.replace(/\n/g, '<br>');
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

// 处理图片加载错误
function handleImageError(e) {
  e.target.src = '/src/assets/default-poster.svg';
}

// 监听ID变化，重新加载
watch(() => props.id, (newId) => {
  if (newId) {
    loadVideoDetail();
  }
});

// 组件挂载时加载数据
onMounted(() => {
  loadVideoDetail();
});
</script>

<style scoped>
.video-detail {
  margin-bottom: 30px;
}

.loading-container,
.error-container,
.empty-container {
  padding: 50px 0;
  text-align: center;
}

.video-detail-content {
  padding: 20px;
  background-color: var(--card-background);
  border-radius: var(--border-radius-medium);
  box-shadow: var(--box-shadow);
}

.video-info-section {
  display: flex;
  margin-bottom: 30px;
}

.video-poster {
  flex: 0 0 240px;
  margin-right: 30px;
}

.video-poster img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.video-info {
  flex: 1;
}

.video-title {
  margin: 0 0 15px;
  font-size: 24px;
  font-weight: 700;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.meta-item {
  margin-right: 20px;
  margin-bottom: 10px;
}

.meta-label {
  font-weight: 500;
  margin-right: 5px;
  color: var(--text-color-light);
}

.video-cast,
.video-director,
.video-update-time {
  margin-bottom: 10px;
}

.cast-list {
  line-height: 1.6;
}

.video-play-section,
.video-player-section,
.video-description {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.no-play-list {
  padding: 20px;
  text-align: center;
  color: var(--text-color-light);
}

.episode-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.episode-list .el-button.is-active {
  background-color: var(--theme-color);
  color: white;
}

.player-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 */
  overflow: hidden;
  margin-top: 20px;
}

.video-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.description-content {
  line-height: 1.8;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .video-info-section {
    flex-direction: column;
  }
  
  .video-poster {
    flex: none;
    margin-right: 0;
    margin-bottom: 20px;
    max-width: 200px;
  }
}
</style> 