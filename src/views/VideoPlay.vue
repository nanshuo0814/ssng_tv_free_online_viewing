<template>
  <div class="video-play-page" :class="{ 'dark-theme': isDarkTheme }">
    <div class="copyright-notice">
      <el-alert
        title="温馨提示"
        type="warning"
        description="本站视频资源来源于网络公开资源，仅供个人学习交流使用，严禁用于商业用途。如果您喜欢本片，请支持正版。"
        show-icon
        :closable="false"
        class="custom-alert"
      />
    </div>
    <div class="back-button-container">
      <el-button @click="goBack" class="back-button">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
    </div>
    <!-- <div class="player-header">
      <el-button 
        :type="isDarkTheme ? 'default' : 'primary'" 
        plain 
        size="small" 
        @click="goBack"
        class="back-button"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回详情页
      </el-button>
    </div> -->

    <div class="player-container">
      <div id="dplayer"></div>
    </div>

    <div class="episode-section">
      <div class="episode-header">
        <div class="title-row">
          <h2 class="video-title">{{ videoInfo?.vod_name }}</h2>
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
        <div class="current-episode">当前播放：{{ currentEpisodeName }}</div>
      </div>

      <div class="episode-list">
        <el-button
          v-for="episode in sortedEpisodes"
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
import { ArrowLeft, SortUp, SortDown, Back } from '@element-plus/icons-vue'
import DPlayer from 'dplayer'
import Hls from 'hls.js/dist/hls.min.js'
import { useThemeStore } from '@/stores/theme'
import { useHistoryStore } from '../stores/history'

const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.theme === 'dark')

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
const hlsInstance = ref(null) // 添加 HLS 实例引用
const isDescending = ref(false) // 排序状态

const historyStore = useHistoryStore()

// 切换排序方式
const toggleEpisodeSort = () => {
  isDescending.value = !isDescending.value
}

// 根据排序状态获取排序后的剧集列表
const sortedEpisodes = computed(() => {
  if (!episodes.value.length) return []
  
  if (isDescending.value) {
    // 降序：从大到小
    return [...episodes.value].sort((a, b) => b.index - a.index)
  } else {
    // 升序：从小到大
    return [...episodes.value]
  }
})

// 计算当前集数名称
const currentEpisodeName = computed(() => {
  return currentEpisode.value?.name || ''
})

// 检查是否是当前播放的集数
const isCurrentEpisode = (episode) => {
  return episode.url === currentEpisode.value?.url
}

// 清理播放器资源
const cleanupPlayer = () => {
  if (hlsInstance.value) {
    try {
      hlsInstance.value.destroy();
      hlsInstance.value = null;
    } catch (error) {
      console.error('销毁 HLS 实例时出错:', error);
    }
  }
  
  if (player.value) {
    try {
      player.value.destroy();
      player.value = null;
    } catch (error) {
      console.error('销毁播放器时出错:', error);
    }
  }
  
  const container = document.getElementById('dplayer');
  if (container) {
    container.innerHTML = '';
  }
}

// 初始化播放器
const initPlayer = (url) => {
  console.log('初始化播放器，URL:', url);
  if (!url) {
    console.error('播放地址为空');
    ElMessage.error('无效的播放地址');
    return;
  }

  // 清理现有资源
  cleanupPlayer();

  const container = document.getElementById('dplayer');
  if (!container) {
    console.error('找不到播放器容器元素');
    ElMessage.error('播放器初始化失败：找不到容器');
    return;
  }

  // 处理华为源中被封锁的域名
  const { source } = route.params;
  let processedUrl = url;
  if (source === 'huawei' && processedUrl.includes('m3u.nikanba.live')) {
    processedUrl = processedUrl.replace('m3u.nikanba.live', 'cos.m3u8hw8.com');
    console.log('播放器初始化 - 华为源域名替换:', processedUrl);
  }

  // 检查是否是速播源、华为源、急速源或360源的直链或iframe链接
  const isDirectUrl = !processedUrl.includes('.m3u8') && 
                    (processedUrl.includes('subokk.com') || 
                     processedUrl.includes('play.subo') || 
                     processedUrl.includes('subo') ||
                     processedUrl.includes('cjhwba.com') ||
                     processedUrl.includes('huawei') ||
                     processedUrl.includes('jisuzy.com') ||
                     processedUrl.includes('jisu') ||
                     processedUrl.includes('360zy') ||
                     processedUrl.match(/\.(mp4|avi|mkv|rmvb|flv)$/i));
  
  if (isDirectUrl) {
    console.log('检测到非HLS链接，使用iframe直接播放:', processedUrl);
    // 使用iframe直接播放视频
    const iframe = document.createElement('iframe');
    iframe.src = processedUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    
    container.innerHTML = '';
    container.appendChild(iframe);
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
          url: processedUrl,
          type: 'customHls',
          customType: {
            customHls: function (video, player) {
              const hls = new Hls();
              hlsInstance.value = hls; // 保存 HLS 实例引用

              // 处理可能被封锁的域名
              let hlsUrl = video.src;
              if (source === 'huawei' && hlsUrl.includes('m3u.nikanba.live')) {
                hlsUrl = hlsUrl.replace('m3u.nikanba.live', 'cos.m3u8hw8.com');
                console.log('HLS加载 - 华为源域名替换:', hlsUrl);
              }

              hls.loadSource(hlsUrl);
              hls.attachMedia(video);
              
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS 清单解析完成');
                video.play();
              });
              
              hls.on(Hls.Events.MANIFEST_LOADED, () => {
                console.log('HLS 清单加载完成');
              });
              
              hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS 错误类型:', data.type, '详情:', data.details, '致命:', data.fatal);
                
                if (data.fatal) {
                  console.error('HLS 致命错误:', data);
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      // 检查是否是清单解析错误（可能是非HLS链接或格式不正确）
                      if (data.details === 'manifestParsingError') {
                        ElMessage.error('视频源格式不正确，尝试使用iframe直接播放');
                        
                        // 尝试直接使用iframe播放
                        try {
                          const videoElement = document.createElement('iframe');
                          videoElement.src = processedUrl;
                          videoElement.width = '100%';
                          videoElement.height = '100%';
                          videoElement.frameBorder = '0';
                          videoElement.allowFullscreen = true;
                          videoElement.style.position = 'absolute';
                          videoElement.style.top = '0';
                          videoElement.style.left = '0';
                          
                          // 清除当前播放器并替换为iframe
                          const container = document.getElementById('dplayer');
                          container.innerHTML = '';
                          container.appendChild(videoElement);
                          
                          // 销毁HLS实例
                          hls.destroy();
                        } catch (err) {
                          console.error('iframe回退失败:', err);
                          ElMessage.error('视频播放失败，请尝试其他播放源');
                        }
                      } else if (data.details === 'manifestLoadError' || data.details === 'levelLoadError') {
                        // 如果是速播源或华为源，尝试使用直接iframe嵌入
                        if (source === 'subo' || source === 'huawei') {
                          ElMessage.error('视频加载失败，尝试直接嵌入播放');
                          try {
                            const videoElement = document.createElement('iframe');
                            videoElement.src = processedUrl;
                            videoElement.width = '100%';
                            videoElement.height = '100%';
                            videoElement.frameBorder = '0';
                            videoElement.allowFullscreen = true;
                            videoElement.style.position = 'absolute';
                            videoElement.style.top = '0';
                            videoElement.style.left = '0';
                            
                            // 清除当前播放器并替换为iframe
                            const container = document.getElementById('dplayer');
                            container.innerHTML = '';
                            container.appendChild(videoElement);
                            
                            // 销毁HLS实例
                            hls.destroy();
                          } catch (err) {
                            console.error('iframe回退失败:', err);
                            ElMessage.error('视频播放失败，请尝试其他播放源');
                          }
                        } else {
                          ElMessage.error('视频加载失败，请检查网络连接');
                          hls.startLoad();
                        }
                      } else {
                        ElMessage.error('视频加载失败，请检查网络连接');
                        hls.startLoad();
                      }
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
      const options = {
        container,
        video: {
          url: processedUrl,
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
      // ElMessage.error('视频加载失败，请稍后重试');
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
  const { id, source } = route.params
  router.push(`/play/${id}/${episode.index + 1}/${source}`)
  currentEpisode.value = episode
  cleanupPlayer() // 在切换剧集前清理资源
  initPlayer(episode.url)
}

// 加载视频信息
const loadVideoInfo = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { id, episode, source } = route.params;
    console.log('加载视频信息，ID:', id, '剧集:', episode, '播放源:', source);
    
    if (!id) {
      throw new Error('视频ID不能为空');
    }
    
    // 根据播放源选择不同的API端点
    let apiEndpoint = '/api';
    if (source === 'ikun') {
      apiEndpoint = '/ikun';
      console.log('使用爱坤API端点获取数据');
    } else if (source === 'subo') {
      apiEndpoint = '/subo';
      console.log('使用速播API端点获取数据, 影片ID:', id);
    } else if (source === 'huawei') {
      apiEndpoint = '/huawei';
      console.log('使用华为API端点获取数据, 影片ID:', id);
    } else if (source === 'jisu') {
      apiEndpoint = '/jisu';
      console.log('使用急速API端点获取数据, 影片ID:', id);
    } else if (source === '360') {
      apiEndpoint = '/360';
      console.log('使用360API端点获取数据, 影片ID:', id);
    } else if (source === 'wolong') {
      apiEndpoint = '/wolong';
      console.log('使用卧龙API端点获取数据, 影片ID:', id);
    }
    
    const response = await axios.get(`${apiEndpoint}/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: id
      }
    }).catch(error => {
      console.error('API请求失败:', error);
      // 如果是爱坤源、速播源、华为源、急速源、360源或卧龙源请求失败，尝试使用默认API
      if (source === 'ikun' || source === 'subo' || source === 'huawei' || source === 'jisu' || source === '360' || source === 'wolong') {
        console.log('尝试使用默认API获取信息');
        return axios.get(`/api/api.php/provide/vod/`, {
          params: {
            ac: 'detail',
            ids: id
          }
        });
      }
      throw error;
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
    console.log('获取到视频信息:', videoInfo.value.vod_name, 'ID:', videoInfo.value.vod_id);
    
    // 解析播放列表
    if (!videoInfo.value.vod_play_from || !videoInfo.value.vod_play_url) {
      throw new Error('视频播放信息不完整');
    }
    
    const playFrom = videoInfo.value.vod_play_from.split(',');
    const playUrl = videoInfo.value.vod_play_url.split(',');
    
    console.log('播放源:', playFrom);
    console.log('播放地址:', playUrl);
    
    // 获取指定源的播放列表
    let sourceIndex = -1;
    
    // 针对不同源特殊处理
    if (source === 'ikun') {
      // 对于爱坤源，优先查找ikm3u8
      sourceIndex = playFrom.findIndex(s => s.toLowerCase().trim() === 'ikm3u8');
    } else if (source === 'jisu') {
      // 对于急速源，查找包含jisu的源
      sourceIndex = playFrom.findIndex(s => 
        s.toLowerCase().trim() === 'jisu' || 
        s.toLowerCase().trim().includes('jisu') || 
        s.toLowerCase().trim().includes('jisuyun') || 
        s.toLowerCase().trim().includes('jism3u8')
      );
    } else if (source === '360') {
      // 对于360源，查找包含360的源
      sourceIndex = playFrom.findIndex(s => 
        s.toLowerCase().trim() === '360' || 
        s.toLowerCase().trim().includes('360') || 
        s.toLowerCase().trim().includes('360yun') || 
        s.toLowerCase().trim().includes('360m3u8')
      );
    } else if (source === 'wolong') {
      // 对于卧龙源，查找包含wolong的源
      sourceIndex = playFrom.findIndex(s => 
        s.toLowerCase().trim() === 'wolong' || 
        s.toLowerCase().trim().includes('wolong') || 
        s.toLowerCase().trim().includes('wolongyun') || 
        s.toLowerCase().trim().includes('wolongm3u8')
      );
    } else {
      // 对于其他源，按照传入的source查找
      sourceIndex = playFrom.findIndex(s => s.toLowerCase().trim() === source.toLowerCase().trim());
    }
    
    console.log('选中的播放源索引:', sourceIndex);
    
    if (sourceIndex === -1) {
      // 如果没有找到指定的源，尝试使用第一个可用的源
      console.warn(`未找到播放源 ${source}，尝试使用第一个可用的源`);
      if (playFrom.length > 0 && playUrl.length > 0) {
        const urlList = playUrl[0].split('#');
        processEpisodes(urlList);
      } else {
        throw new Error('没有可用的播放源');
      }
    } else {
      // 解析选中的播放源
      const urlList = playUrl[sourceIndex].split('#');
      processEpisodes(urlList);
    }
    
    // 处理播放源数据
    function processEpisodes(urlList) {
      episodes.value = urlList.map((item, index) => {
        const [name, url] = item.split('$');
        return {
          name: name?.trim() || `第${index + 1}集`,
          url: url?.trim() || '',
          index
        };
      }).filter(episode => episode.url);
      
      // 记录当前集数
      const episodeIdx = parseInt(episode) - 1;
      if (episodes.value.length > 0) {
        if (episodeIdx >= 0 && episodeIdx < episodes.value.length) {
          currentEpisode.value = episodes.value[episodeIdx];
        } else {
          currentEpisode.value = episodes.value[0];
        }
      }
      
      // 初始化播放器
      if (currentEpisode.value && currentEpisode.value.url) {
        initPlayer(currentEpisode.value.url);
        
        // 添加到播放历史
        if (videoInfo.value) {
          const historyItem = {
            id: videoInfo.value.vod_id,
            title: videoInfo.value.vod_name,
            url: route.fullPath,
            type: getVideoType(),
            poster: videoInfo.value.vod_pic || '',
            currentTime: 0,
            episode: episode,
            source: source,
            episodeName: currentEpisode.value.name
          };
          
          historyStore.addHistory(historyItem);
        }
      } else {
        throw new Error('无有效播放地址');
      }
    }
    
    loading.value = false;
  } catch (error) {
    console.error('加载视频信息失败:', error);
    loading.value = false;
    error.value = error.message || '加载失败';
    ElMessage.error(error.value);
  }
};

// 返回详情页
// const goBack = () => {
//   const { id } = route.params
//   router.push(`/video/detail/${id}`)
// }
// 返回上一页
const goBack = () => {
  router.back();
};
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

// 获取视频类型
const getVideoType = () => {
  // 从URL中提取类型
  const pathParts = route.path.split('/')
  const type = pathParts[1] // 例如 /tv/play/... 中的 tv
  return type
}

// 组件挂载时初始化
onMounted(() => {
  historyStore.loadFromLocal()
  loadVideoInfo()
})

// 组件销毁时清理
onBeforeUnmount(() => {
  cleanupPlayer()
})

// 监听路由参数变化
watch(() => route.params, (newParams) => {
  if (newParams.id && newParams.episode) {
    cleanupPlayer() // 在路由变化时清理资源
    loadVideoInfo()
  }
}, { deep: true })
</script>

<style scoped>
.video-play-page {
  min-height: 100vh;
  background-color: var(--page-background);
  padding: 20px;
  transition: background-color 0.3s ease;
}

.copyright-notice {
  max-width: 1200px;
  margin: 0 auto 20px;
}

/* 自定义 Alert 样式 */
:deep(.custom-alert) {
  background-color: var(--el-color-warning-light-9) !important;
  color: var(--el-text-color-primary) !important;
}

:deep(.custom-alert .el-alert__title) {
  color: var(--el-text-color-primary) !important;
}

:deep(.custom-alert .el-alert__description) {
  color: var(--el-text-color-regular) !important;
}

.dark-theme :deep(.custom-alert) {
  background-color: rgba(230, 162, 60, 0.1) !important;
  border-color: rgba(230, 162, 60, 0.3) !important;
}

.dark-theme :deep(.custom-alert .el-alert__icon) {
  color: var(--el-color-warning) !important;
}

.player-header {
  max-width: 1200px;
  margin: 0 auto 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.back-button-container {
  /* padding: 16px; */
  margin-bottom: 16px;
}
/* .back-button {
  height: 30px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
} */

.dark-theme .back-button {
  color: var(--el-text-color-primary);
  border-color: var(--el-border-color);
}

.dark-theme .back-button:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
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

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.video-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
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

.current-episode {
  font-size: 14px;
  color: var(--text-color-light);
}

.episode-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  padding: 5px;
  width: 100%;
  overflow-x: auto;
}

.episode-list .el-button {
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
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .episode-list .el-button {
    min-width: 100px;
    min-height: 36px;
    font-size: 13px;
    padding: 6px 8px;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .episode-list {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }
}
</style> 