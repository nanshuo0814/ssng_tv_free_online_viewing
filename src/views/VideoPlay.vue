<template>
  <div class="video-play-page">
    <div class="copyright-notice">
      <el-alert
        title="温馨提示"
        type="warning"
        description="本站视频资源来源于网络公开资源，仅供个人学习交流使用，严禁用于商业用途。如果您喜欢本片，请支持正版。"
        show-icon
        :closable="false"
      />
    </div>

    <div class="player-header">
      <el-button 
        type="primary" 
        plain 
        size="small" 
        @click="goBack"
        class="back-button"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回详情页
      </el-button>
    </div>

    <div class="player-container">
      <div id="dplayer"></div>
    </div>

    <div class="episode-section">
      <div class="episode-header">
        <h2 class="video-title">{{ videoInfo?.vod_name }}</h2>
        <div class="current-episode">当前播放：{{ currentEpisodeName }}</div>
      </div>

      <div class="episode-list">
        <el-button
          v-for="episode in episodes"
          :key="episode.url"
          :class="{ 'is-active': isCurrentEpisode(episode) }"
          @click="switchEpisode(episode)"
          size="small"
        >
          {{ episode.name }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import DPlayer from 'dplayer'
import Hls from 'hls.js/dist/hls.min.js'

// 添加 DPlayer 样式
const style = document.createElement('link')
style.rel = 'stylesheet'
style.href = 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css'
document.head.appendChild(style)

const route = useRoute()
const router = useRouter()

// 状态
const videoInfo = ref(null)
const player = ref(null)
const loading = ref(true)
const episodes = ref([])
const currentEpisode = ref(null)
const error = ref(null)

// 计算当前集数名称
const currentEpisodeName = computed(() => {
  return currentEpisode.value?.name || ''
})

// 检查是否是当前播放的集数
const isCurrentEpisode = (episode) => {
  return episode.url === currentEpisode.value?.url
}

// 初始化播放器
const initPlayer = (url) => {
  console.log('初始化播放器，URL:', url);
  if (!url) {
    console.error('播放地址为空');
    ElMessage.error('无效的播放地址');
    return;
  }

  if (player.value) {
    console.log('销毁现有播放器');
    player.value.destroy();
    player.value = null;
  }

  const container = document.getElementById('dplayer');
  if (!container) {
    console.error('找不到播放器容器元素');
    ElMessage.error('播放器初始化失败：找不到容器');
    return;
  }

  try {
    console.log('创建新的播放器实例');
    
    // 检查浏览器是否支持 HLS
    if (Hls.isSupported()) {
      console.log('浏览器支持 HLS');
      const options = {
        container,
        video: {
          url: url,
          type: 'customHls',
          customType: {
            customHls: function (video, player) {
              const hls = new Hls();
              hls.loadSource(video.src);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS 清单解析完成');
                video.play();
              });
              hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  console.error('HLS 错误:', data);
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      ElMessage.error('视频加载失败，请检查网络连接');
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      ElMessage.error('视频解码错误，尝试恢复');
                      hls.recoverMediaError();
                      break;
                    default:
                      ElMessage.error('视频播放错误，请刷新页面重试');
                      hls.destroy();
                      break;
                  }
                }
              });
            }
          }
        },
        autoplay: true,
        theme: '#409eff',
        lang: 'zh-cn',
        screenshot: true,
        hotkey: true,
        preload: 'auto',
        volume: 0.7,
      };

      player.value = new DPlayer(options);
    } else if (container.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('浏览器原生支持 HLS');
      // 对于 Safari 等原生支持 HLS 的浏览器
      const options = {
        container,
        video: {
          url: url,
          type: 'auto'
        },
        autoplay: true,
        theme: '#409eff',
        lang: 'zh-cn',
        screenshot: true,
        hotkey: true,
        preload: 'auto',
        volume: 0.7,
      };

      player.value = new DPlayer(options);
    } else {
      console.error('浏览器不支持 HLS');
      ElMessage.error('您的浏览器不支持播放此视频');
      return;
    }

    // 监听播放器事件
    player.value.on('error', (error) => {
      console.error('播放器错误:', error);
      ElMessage.error('视频加载失败，请稍后重试');
    });

    player.value.on('loadeddata', () => {
      console.log('视频数据加载完成');
    });

    player.value.on('canplay', () => {
      console.log('视频可以播放');
    });

    player.value.on('waiting', () => {
      console.log('视频正在缓冲');
    });

  } catch (error) {
    console.error('初始化播放器失败:', error);
    ElMessage.error('初始化播放器失败: ' + error.message);
  }
}

// 切换集数
const switchEpisode = (episode) => {
  const { id } = route.params
  router.push(`/play/${id}/${episode.index + 1}/heimuer`)
  currentEpisode.value = episode
  initPlayer(episode.url)
}

// 加载视频信息
const loadVideoInfo = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { id, episode } = route.params;
    console.log('加载视频信息，ID:', id, '剧集:', episode);
    
    if (!id) {
      throw new Error('视频ID不能为空');
    }
    
    const response = await axios.get(`/api/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: id
      }
    });
    
    console.log('API响应:', response.data);
    
    if (!response.data) {
      throw new Error('API响应数据为空');
    }
    
    if (response.data.code !== 1) {
      throw new Error(response.data.msg || '获取视频详情失败');
    }
    
    if (!response.data.list || response.data.list.length === 0) {
      throw new Error('未找到视频信息');
    }
    
    videoInfo.value = response.data.list[0];
    
    // 解析播放列表
    if (!videoInfo.value.vod_play_from || !videoInfo.value.vod_play_url) {
      throw new Error('视频播放信息不完整');
    }
    
    const playFrom = videoInfo.value.vod_play_from.split(',');
    const playUrl = videoInfo.value.vod_play_url.split(',');
    
    console.log('播放源:', playFrom);
    console.log('播放地址:', playUrl);
    
    // 获取 heimuer 源的播放列表
    const heimuerIndex = playFrom.findIndex(source => 
      source.toLowerCase().trim() === 'heimuer'
    );
    
    console.log('heimuer源索引:', heimuerIndex);
    
    if (heimuerIndex === -1) {
      throw new Error('未找到 heimuer 播放源');
    }
    
    if (!playUrl[heimuerIndex]) {
      throw new Error('播放地址列表为空');
    }
    
    const urlList = playUrl[heimuerIndex].split('#');
    console.log('解析的URL列表:', urlList);
    
    episodes.value = urlList.map((item, index) => {
      const [name, url] = item.split('$');
      if (!url) {
        console.warn(`第${index + 1}集缺少播放地址`);
        return null;
      }
      return {
        name: name?.trim() || `第${index + 1}集`,
        url: url.trim(),
        index
      };
    }).filter(Boolean);
    
    console.log('解析的剧集列表:', episodes.value);
    
    if (episodes.value.length === 0) {
      throw new Error('没有可用的剧集');
    }

    // 设置当前集数
    const episodeNumber = parseInt(episode) - 1;
    console.log('目标剧集编号:', episodeNumber);
    
    if (isNaN(episodeNumber) || episodeNumber < 0 || episodeNumber >= episodes.value.length) {
      throw new Error('无效的剧集编号');
    }
    
    currentEpisode.value = episodes.value[episodeNumber];
    console.log('当前选中剧集:', currentEpisode.value);
    
    if (!currentEpisode.value.url) {
      throw new Error('当前剧集缺少播放地址');
    }
    
    initPlayer(currentEpisode.value.url);
  } catch (error) {
    console.error('加载视频信息失败:', error);
    ElMessage.error(error.message || '加载视频信息失败');
  } finally {
    loading.value = false;
  }
}

// 返回详情页
const goBack = () => {
  const { id } = route.params
  router.push(`/video/detail/${id}`)
}

// 组件挂载时初始化
onMounted(() => {
  loadVideoInfo()
})

// 组件销毁时清理
onBeforeUnmount(() => {
  if (player.value) {
    player.value.destroy()
  }
})

// 监听路由参数变化
watch(() => route.params, (newParams) => {
  if (newParams.id && newParams.episode) {
    loadVideoInfo()
  }
}, { deep: true })
</script>

<style scoped>
.video-play-page {
  min-height: 100vh;
  background-color: var(--page-background);
  padding: 20px;
}

.copyright-notice {
  max-width: 1200px;
  margin: 0 auto 20px;
}

.player-header {
  max-width: 1200px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.player-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--card-background);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  position: relative;
  padding-top: 56.25%; /* 16:9 宽高比 */
}

#dplayer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.episode-section {
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 20px;
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

.episode-header {
  margin-bottom: 20px;
}

.video-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 10px;
}

.current-episode {
  font-size: 14px;
  color: var(--text-color-light);
}

.episode-list {
  display: grid;
  grid-template-columns: repeat(14, minmax(60px, 1fr));
  gap: 10px;
  padding: 5px;
  width: 100%;
  overflow-x: auto;
}

.episode-list::-webkit-scrollbar {
  height: 6px;
}

.episode-list::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 3px;
}

.episode-list::-webkit-scrollbar-track {
  background-color: var(--scrollbar-track);
  border-radius: 3px;
}

.episode-list .el-button {
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

.episode-list .el-button:hover {
  background-color: var(--button-hover-bg);
  border-color: var(--theme-color);
  color: var(--theme-color);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.episode-list .el-button.is-active {
  background-color: var(--theme-color);
  color: white;
  border-color: var(--theme-color);
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(var(--theme-color-rgb), 0.3);
}

@media (max-width: 768px) {
  .video-play-page {
    padding: 10px;
  }

  .episode-section {
    padding: 15px;
  }

  .episode-list {
    grid-template-columns: repeat(7, minmax(50px, 1fr));
    gap: 8px;
  }

  .episode-list .el-button {
    width: 50px;
    height: 36px;
    font-size: 13px;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .episode-list {
    grid-template-columns: repeat(10, minmax(55px, 1fr));
  }

  .episode-list .el-button {
    width: 55px;
  }
}
</style> 