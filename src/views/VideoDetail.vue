<template>
  <div class="video-detail-page">
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

            <div class="meta-item">
              <span class="meta-label">评分：</span>
              <span>{{ videoInfo.vod_score || '暂无评分' }}</span>
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

          <div class="action-buttons">
            <el-button type="primary" @click="startPlay" v-if="playLists.length > 0">
              <el-icon class="button-icon"><VideoPlay /></el-icon>
              立即播放
            </el-button>
            <el-button type="warning" @click="addToFavorites">
              <el-icon class="button-icon"><Star /></el-icon>
              收藏
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="video-play-section" v-if="playLists.length > 0">
        <div class="section-title">播放列表</div>
        
        <div class="play-tabs">
          <el-tabs v-model="activePlaySource" type="card">
            <el-tab-pane 
              v-for="(playList, index) in playLists" 
              :key="index"
              :label="playList.source"
              :name="playList.source"
            >
              <div class="episode-grid">
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
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { VideoPlay, Star } from '@element-plus/icons-vue'

// 从路由参数中获取视频ID
const route = useRoute();
const router = useRouter();
const videoId = ref(route.params.id);

// 数据状态
const loading = ref(false);
const error = ref(null);
const videoInfo = ref(null);
const activePlaySource = ref('');
const activeEpisode = ref('');
const currentPlayUrl = ref('');

// 添加到收藏夹
function addToFavorites() {
  if (!videoInfo.value) return;
  
  try {
    // 获取当前收藏列表
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // 检查是否已经收藏
    const exists = favorites.some(item => item.vod_id === videoInfo.value.vod_id);
    
    if (exists) {
      ElMessage.warning('已经在收藏夹中');
      return;
    }
    
    // 添加到收藏夹
    favorites.push({
      vod_id: videoInfo.value.vod_id,
      vod_name: videoInfo.value.vod_name,
      vod_pic: videoInfo.value.vod_pic,
      vod_remarks: videoInfo.value.vod_remarks,
      vod_year: videoInfo.value.vod_year,
      add_time: new Date().toISOString()
    });
    
    // 保存到本地存储
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    ElMessage.success('已添加到收藏夹');
  } catch (error) {
    console.error('添加收藏失败', error);
    ElMessage.error('添加收藏失败');
  }
}

// 开始播放第一集
function startPlay() {
  if (playLists.value.length > 0 && playLists.value[0].episodes.length > 0) {
    const firstPlaylist = playLists.value[0];
    const firstEpisode = firstPlaylist.episodes[0];
    
    playEpisode(firstPlaylist.source, firstEpisode.url);
  }
}

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
  if (!currentPlayUrl.value) return '';
  
  // 使用自定义播放页面，传递视频URL和标题作为参数
  return `/player.html?url=${encodeURIComponent(currentPlayUrl.value)}&title=${encodeURIComponent(videoInfo.value ? videoInfo.value.vod_name : '')}`;
});

// 加载视频详情
async function loadVideoDetail() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get(`/api/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: videoId.value
      }
    })
    const result = response.data;

    
    if (result && result.code === 1 && result.list && result.list.length > 0) {
      videoInfo.value = result.list[0];
      
      // 保存到观看历史
      saveToHistory(videoInfo.value);
      
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

// 保存到观看历史
function saveToHistory(video) {
  try {
    // 获取当前历史记录
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    
    // 删除已存在的相同ID记录
    const filtered = history.filter(item => item.vod_id !== video.vod_id);
    
    // 添加新记录到开头
    filtered.unshift({
      vod_id: video.vod_id,
      vod_name: video.vod_name,
      vod_pic: video.vod_pic,
      vod_remarks: video.vod_remarks,
      vod_year: video.vod_year,
      watch_time: new Date().toISOString()
    });
    
    // 只保留最近的50条记录
    const trimmed = filtered.slice(0, 50);
    
    // 保存到本地存储
    localStorage.setItem('watchHistory', JSON.stringify(trimmed));
  } catch (error) {
    console.error('保存历史记录失败', error);
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
watch(() => route.params.id, (newId) => {
  if (newId && newId !== videoId.value) {
    videoId.value = newId;
    loadVideoDetail();
  }
});

// 组件挂载时加载数据
onMounted(() => {
  loadVideoDetail();
});
</script>

<style scoped>
.video-detail-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--text-color);
}

.loading-container,
.error-container,
.empty-container {
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-detail-content {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
}

.video-info-section {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.video-poster {
  flex: 0 0 250px;
  height: 350px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: var(--image-shadow);
}

.video-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  flex: 1;
}

.video-title {
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-color);
}

.video-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  color: var(--text-color-light);
  margin-right: 8px;
  font-weight: 500;
}

.video-cast,
.video-director,
.video-update-time {
  margin-bottom: 16px;
}

.cast-list {
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-buttons .el-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
}

.button-icon {
  font-size: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.play-tabs {
  margin-top: 16px;
  background-color: var(--card-background);
  border-radius: 12px;
  /* padding: 20px; */
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(14, minmax(60px, 1fr));
  gap: 10px;
  margin-top: 20px;
  padding: 5px;
  width: 100%;
  overflow-x: auto;
}

.episode-grid::-webkit-scrollbar {
  height: 6px;
}

.episode-grid::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 3px;
}

.episode-grid::-webkit-scrollbar-track {
  background-color: var(--scrollbar-track);
  border-radius: 3px;
}

.episode-grid .el-button {
  width: 60px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: var(--button-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.episode-grid .el-button:hover {
  background-color: var(--button-hover-bg);
  border-color: var(--theme-color);
  color: var(--theme-color);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.episode-grid .el-button.is-active {
  background-color: var(--theme-color);
  color: white;
  border-color: var(--theme-color);
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(var(--theme-color-rgb), 0.3);
}

.video-description {
  margin-top: 30px;
}

.description-content {
  line-height: 1.8;
  color: var(--text-color);
  white-space: pre-line;
}

:deep(.el-tabs__header) {
  margin: 0;
  border-bottom: none;
}

:deep(.el-tabs--card > .el-tabs__header) {
  border-bottom: none;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: none;
  background-color: transparent;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: 1px solid var(--border-color);
  background-color: var(--button-bg);
  color: var(--text-color);
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 6px;
  height: 36px;
  line-height: 36px;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item:first-child) {
  margin-left: 0;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item:hover) {
  color: var(--theme-color);
  border-color: var(--theme-color);
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  background-color: var(--theme-color);
  border-color: var(--theme-color);
  color: white;
}

@media (max-width: 768px) {
  .video-info-section {
    flex-direction: column;
  }

  .video-poster {
    width: 200px;
    height: 280px;
    margin: 0 auto;
  }

  .video-meta {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .play-tabs {
    /* padding: 16px; */
  }

  .episode-grid {
    grid-template-columns: repeat(7, minmax(50px, 1fr));
    gap: 8px;
  }

  .episode-grid .el-button {
    width: 50px;
    height: 36px;
    font-size: 13px;
  }

  :deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
    margin: 0 4px;
    padding: 0 12px;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .episode-grid {
    grid-template-columns: repeat(10, minmax(55px, 1fr));
    gap: 10px;
  }

  .episode-grid .el-button {
    width: 55px;
  }
}

@media (min-width: 1201px) {
  .episode-grid {
    grid-template-columns: repeat(14, minmax(60px, 1fr));
  }

  .episode-grid .el-button {
    width: 60px;
  }
}
</style> 