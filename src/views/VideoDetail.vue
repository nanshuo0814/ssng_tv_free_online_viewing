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
              <span class="button-text">立即播放</span>
            </el-button>
            <el-button 
              :type="isFavorited ? 'info' : 'success'" 
              @click="toggleFavorite"
            >
              <el-icon class="button-icon">
                <Star :class="{ 'is-favorited': isFavorited }" />
              </el-icon>
              <span class="button-text">{{ isFavorited ? '取消收藏' : '收藏' }}</span>
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="video-play-section" v-if="playLists.length > 0">
        <div class="section-title">
          播放列表
          <el-button
            class="sort-button"
            @click="toggleEpisodeSort"
            title="切换排序"
          >
            <el-icon>
              <component :is="isDescending ? 'SortDown' : 'SortUp'" />
            </el-icon>
            {{ isDescending ? '降序' : '升序' }}
          </el-button>
        </div>
        
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
                  v-for="(episode, index) in getSortedEpisodes(playList.episodes)"
                  :key="episode.url"
                  :class="{ 'is-active': activeEpisode === episode.url }"
                  @click="playEpisode(playList.source, episode.url, episode.index)"
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
import { VideoPlay, Star, SortUp, SortDown } from '@element-plus/icons-vue'
import { useHistoryStore } from '../stores/history'
import { useFavoriteStore } from '../stores/favorite'

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

// 在 setup 中添加
const historyStore = useHistoryStore()
const favoriteStore = useFavoriteStore()

// 判断是否已收藏
const isFavorited = computed(() => {
  return videoInfo.value ? favoriteStore.isFavorited(videoInfo.value.vod_id) : false;
});

// 切换收藏状态
function toggleFavorite() {
  if (!videoInfo.value) return;
  
  if (isFavorited.value) {
    // 取消收藏
    if (favoriteStore.removeFavorite(videoInfo.value.vod_id)) {
      ElMessage.success('已取消收藏');
    }
  } else {
    // 添加收藏
    const favoriteItem = {
      id: videoInfo.value.vod_id,
      title: videoInfo.value.vod_name,
      poster: videoInfo.value.vod_pic,
      type: getVideoType(),
      remarks: videoInfo.value.vod_remarks,
      year: videoInfo.value.vod_year,
      area: videoInfo.value.vod_area,
      actors: videoInfo.value.vod_actor,
      director: videoInfo.value.vod_director,
      score: videoInfo.value.vod_score
    };
    
    if (favoriteStore.addFavorite(favoriteItem)) {
      ElMessage.success('已添加到收藏');
    }
  }
}

// 获取视频类型
function getVideoType() {
  // 从URL中提取类型
  const pathParts = route.path.split('/')
  const type = pathParts[1] // 例如 /tv/detail/... 中的 tv
  return type || 'video'
}

// 开始播放第一集
function startPlay() {
  if (playLists.value.length > 0 && playLists.value[0].episodes.length > 0) {
    const { vod_id } = videoInfo.value
    router.push(`/play/${vod_id}/1/heimuer`)
  }
}

// 播放列表
const playLists = computed(() => {
  if (!videoInfo.value || !videoInfo.value.vod_play_from || !videoInfo.value.vod_play_url) {
    return [];
  }
  
  const playFrom = videoInfo.value.vod_play_from.split(',');
  const playUrl = videoInfo.value.vod_play_url.split(',');
  
  return playFrom.map((source, index) => {
    const urlList = playUrl[index] ? playUrl[index].split('#') : [];
    
    return {
      source: source.trim(),
      episodes: urlList.map((item, episodeIndex) => {
        const [name, url] = item.split('$');
        return {
          name: name?.trim() || `第${episodeIndex + 1}集`,
          url: url?.trim() || '',
          index: episodeIndex
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

// 在视频信息加载成功后添加到历史记录
const addToHistory = () => {
  if (videoInfo.value) {
    const historyItem = {
      id: videoInfo.value.vod_id,
      title: videoInfo.value.vod_name,
      type: getVideoType(),
      url: route.fullPath,
      poster: videoInfo.value.vod_pic,
      description: videoInfo.value.vod_content,
      actors: videoInfo.value.vod_actor,
      director: videoInfo.value.vod_director,
      year: videoInfo.value.vod_year,
      area: videoInfo.value.vod_area,
      remarks: videoInfo.value.vod_remarks,
      score: videoInfo.value.vod_score
    }
    console.log('添加到历史记录:', historyItem)
    historyStore.addHistory(historyItem)
  }
}

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
      
      // 获取到视频信息后添加到历史记录
      addToHistory();
      
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
function playEpisode(source, url, index) {
  const { vod_id } = videoInfo.value
  router.push(`/play/${vod_id}/${index + 1}/heimuer`)
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

// 确保在组件挂载时加载历史记录
onMounted(() => {
  historyStore.loadFromLocal()
  loadVideoDetail()
})

// 排序状态
const isDescending = ref(false);

// 切换排序方式
function toggleEpisodeSort() {
  isDescending.value = !isDescending.value;
}

// 获取排序后的剧集列表
function getSortedEpisodes(episodes) {
  if (!episodes) return [];
  
  if (isDescending.value) {
    // 降序：从大到小
    return [...episodes].sort((a, b) => b.index - a.index);
  } else {
    // 升序：从小到大
    return [...episodes];
  }
}
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
  gap: 8px;
  padding: 12px 20px;
}

.button-icon {
  font-size: 16px;
}

.button-text {
  margin-left: 4px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  padding: 2px 8px;
  height: 24px;
  margin-bottom: 2px;
  color: var(--theme-color);
  border: none;
  background: transparent;
}

.sort-button:hover {
  background-color: rgba(var(--theme-color-rgb), 0.1);
  border-radius: 4px;
}

.play-tabs {
  margin-top: 15px;
}

.play-tabs :deep(.el-tabs__content) {
  padding: 15px 0;
}

.play-tabs :deep(.el-tabs__nav) {
  border-radius: 8px 8px 0 0;
}

.play-tabs :deep(.el-tabs__item) {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: 500;
}

.play-tabs :deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  padding: 0px;
  width: 100%;
}

.episode-grid .el-button {
  width: 100%;
  min-width: 120px;
  height: auto;
  min-height: 40px;
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
  padding: 8px 12px;
  margin: 0;
  white-space: normal;
  word-break: break-word;
  line-height: 1.2;
  text-align: center;
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
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .episode-grid .el-button {
    min-width: 100px;
    min-height: 36px;
    font-size: 13px;
    padding: 6px 8px;
  }

  :deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
    margin: 0 4px;
    padding: 0 12px;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .episode-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }
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
  .play-tabs :deep(.el-tabs__item) {
    padding: 0 15px;
    height: 36px;
    line-height: 36px;
    font-size: 13px;
  }
}

.is-favorited {
  color: #ffd04b !important;
  transform: scale(1.1);
}
</style> 