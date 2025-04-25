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
    <div v-if="isPipSupported" class="pip-tip">
      <el-alert
        title="新功能：画中画模式"
        type="info"
        description="您可以点击视频右上角的画中画按钮，或按键盘P键切换画中画模式，方便您边看视频边做其他事情。"
        show-icon
        :closable="true"
        @close="hidePipTip"
        class="custom-alert pip-alert"
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
      <div class="player-controls">
        <el-button
          class="pip-button"
          @click="togglePictureInPicture"
          size="small"
          :disabled="!isPipSupported"
          :title="isPipSupported ? '画中画模式' : '您的浏览器不支持画中画功能'"
        >
          <el-icon><Picture /></el-icon>
          画中画
        </el-button>
      </div>
    </div>

    <div class="episode-section">
      <div class="episode-header">
        <div class="title-row">
          <h2 class="video-title">{{ videoInfo?.vod_name }}</h2>
          <div class="controls-row">
            <el-select 
              v-model="currentSource" 
              placeholder="选择播放源" 
              size="small"
              @change="changePlaybackSource"
              class="source-select"
            >
              <el-option 
                v-for="sourceItem in availableSources" 
                :key="sourceItem.value" 
                :label="sourceItem.label" 
                :value="sourceItem.value"
              />
            </el-select>
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
import { ArrowLeft, SortUp, SortDown, Back, Picture } from '@element-plus/icons-vue'
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

// 播放源相关
const currentSource = ref('')
const availableSources = ref([
  { label: '黑木耳', value: 'api' },  // 注意这里使用'api'作为黑木耳的值
  { label: '爱坤', value: 'ikun' },
  { label: '卧龙', value: 'wolong' },
  { label: '360', value: '360' },
  { label: '华为', value: 'huawei' },
  { label: '急速', value: 'jisu' },
  { label: '速播', value: 'subo' },
])

const historyStore = useHistoryStore()

// 画中画相关状态和功能
const isPipSupported = ref(false)
const videoElement = ref(null)

// 添加画中画提示控制
const showPipTip = ref(true)

// 隐藏画中画提示
const hidePipTip = () => {
  showPipTip.value = false
  // 记住用户已经看过提示，存储到本地
  localStorage.setItem('pipTipShown', 'true')
}

// 检查是否应该显示画中画提示
const checkShouldShowPipTip = () => {
  // 如果用户已经看过提示，不再显示
  const tipShown = localStorage.getItem('pipTipShown')
  showPipTip.value = tipShown !== 'true'
}

// 检查浏览器是否支持画中画
const checkPipSupport = () => {
  const video = document.createElement('video')
  isPipSupported.value = video.requestPictureInPicture !== undefined || 
                        (document.pictureInPictureEnabled && !video.disablePictureInPicture)
  console.log('Picture-in-Picture 支持状态:', isPipSupported.value)
}

// 切换画中画模式
const togglePictureInPicture = async () => {
  try {
    // 查找视频元素
    if (!videoElement.value) {
      // 尝试获取DPlayer中的video元素
      const dplayerContainer = document.getElementById('dplayer')
      videoElement.value = dplayerContainer?.querySelector('video')
      
      // 如果在DPlayer中找不到，尝试查找整个页面中可能的video元素
      if (!videoElement.value) {
        videoElement.value = document.querySelector('video')
      }
    }
    
    if (!videoElement.value) {
      throw new Error('未找到视频元素')
    }
    
    // 检查视频元数据是否已加载
    if (!isVideoReadyForPip()) {
      ElMessage.warning('视频正在加载，请稍后再试')
      
      // 添加一次性监听器等待视频加载，然后自动进入画中画模式
      const onLoadedMetadata = () => {
        ElMessage.success('视频已准备好，正在进入画中画模式')
        videoElement.value.removeEventListener('loadedmetadata', onLoadedMetadata)
        
        // 视频准备好后自动尝试进入画中画模式
        setTimeout(() => {
          togglePictureInPicture()
        }, 500)
      }
      
      videoElement.value.addEventListener('loadedmetadata', onLoadedMetadata)
      return
    }
    
    // 如果当前在画中画模式，退出画中画
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
      console.log('已退出画中画模式')
      ElMessage.success('已退出画中画模式')
    } else {
      // 否则进入画中画模式
      await videoElement.value.requestPictureInPicture()
      console.log('已进入画中画模式')
      ElMessage.success('已进入画中画模式')
    }
  } catch (error) {
    console.error('切换画中画模式失败:', error)
    
    // 根据错误类型提供更友好的提示
    if (error.name === 'InvalidStateError') {
      ElMessage.warning('视频尚未准备好，请等待视频加载后再试')
    } else {
      ElMessage.error(`画中画功能出错: ${error.message || '未知错误'}`)
    }
  }
}

// 在播放器初始化后更新videoElement引用
const updateVideoElementRef = () => {
  setTimeout(() => {
    const dplayerContainer = document.getElementById('dplayer')
    const video = dplayerContainer?.querySelector('video')
    
    if (video) {
      videoElement.value = video
      console.log('视频元素引用已更新:', videoElement.value)
      
      // 添加视频元数据加载事件监听
      const onLoadedMetadata = () => {
        console.log('视频元数据已加载完成，视频准备就绪')
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
      }
      
      if (video.readyState >= 1) {
        console.log('视频元数据已经加载完成')
      } else {
        console.log('等待视频元数据加载...')
        video.addEventListener('loadedmetadata', onLoadedMetadata)
      }
    } else {
      console.log('未找到视频元素，将在稍后重试')
      // 多尝试几次查找，有时播放器初始化需要更长时间
      if (retryCount < 5) {
        retryCount++
        setTimeout(updateVideoElementRef, 1000)
      }
    }
  }, 1000) // 给播放器一些初始化时间
}

// 尝试重新获取视频元素的次数
const retryCount = ref(0)

// 检查视频是否准备好进入画中画模式
const isVideoReadyForPip = () => {
  // 视频元素存在 且 已加载元数据 (readyState >= 1 表示元数据已加载)
  return videoElement.value && videoElement.value.readyState >= 1;
}

// 切换播放源
const changePlaybackSource = async (newSource) => {
  const { id, episode } = route.params;
  loading.value = true;
  
  try {
    // 先获取当前视频的名称，用于在新源中搜索
    const videoName = videoInfo.value?.vod_name;
    
    if (!videoName) {
      ElMessage.error('无法获取当前视频信息，无法切换播放源');
      loading.value = false;
      return;
    }
    
    console.log(`正在切换到${newSource}播放源，搜索：${videoName}`);
    
    // 确定API端点
    let apiEndpoint = '/api';
    if (newSource === 'ikun') {
      apiEndpoint = '/ikun';
    } else if (newSource === 'subo') {
      apiEndpoint = '/subo';
    } else if (newSource === 'huawei') {
      apiEndpoint = '/huawei';
    } else if (newSource === 'jisu') {
      apiEndpoint = '/jisu';
    } else if (newSource === '360') {
      apiEndpoint = '/360';
    } else if (newSource === 'wolong') {
      apiEndpoint = '/wolong';
    }
    
    // 使用影片名称在新源中搜索对应的ID
    const searchResponse = await axios.get(`${apiEndpoint}/api.php/provide/vod/`, {
      params: {
        ac: 'list',
        wd: videoName
      }
    }).catch(error => {
      console.error('搜索新源API失败:', error);
      // 如果搜索失败尝试使用默认API
      if (newSource !== 'api') {
        console.log('尝试使用默认API搜索');
        return axios.get(`/api/api.php/provide/vod/`, {
          params: {
            ac: 'list',
            wd: videoName
          }
        });
      }
      throw error;
    });
    
    if (!searchResponse.data || searchResponse.data.code !== 1 || !searchResponse.data.list || searchResponse.data.list.length === 0) {
      // 如果在新源中找不到匹配的视频，使用原ID
      console.warn(`在${newSource}源中未找到匹配的视频，使用原ID`);
      ElMessage.warning(`未在${newSource}源中找到该视频，可能播放异常`);
      router.push(`/play/${id}/${episode}/${newSource}`);
      return;
    }
    
    // 查找最匹配的结果
    const results = searchResponse.data.list;
    console.log(`在${newSource}源中找到${results.length}个匹配结果`);
    
    // 尝试找到完全匹配的视频名称
    let matchedVideo = results.find(item => item.vod_name === videoName);
    
    // 如果没有完全匹配，选择第一个结果
    if (!matchedVideo && results.length > 0) {
      matchedVideo = results[0];
      console.log(`未找到完全匹配，使用第一个结果: ${matchedVideo.vod_name}`);
    }
    
    if (matchedVideo) {
      const newId = matchedVideo.vod_id;
      console.log(`找到匹配视频，ID: ${newId}，名称: ${matchedVideo.vod_name}`);
      // 导航到新的播放源，使用新的ID
      router.push(`/play/${newId}/1/${newSource}`);
    } else {
      // 如果仍然找不到，使用原ID
      console.warn(`在${newSource}源中未找到匹配的视频，使用原ID`);
      ElMessage.warning(`未在${newSource}源中找到该视频，可能播放异常`);
      router.push(`/play/${id}/${episode}/${newSource}`);
    }
    
  } catch (error) {
    console.error('切换播放源时出错:', error);
    ElMessage.error('切换播放源失败: ' + (error.message || '未知错误'));
    // 出错时仍然尝试使用原ID切换
    router.push(`/play/${id}/${episode}/${newSource}`);
  } finally {
    loading.value = false;
  }
}

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

// 添加计算属性：判断URL是否是直链媒体
const isDirectUrl = computed(() => {
  if (!currentEpisode.value?.url) return false;
  
  let url = currentEpisode.value.url;
  const { source } = route.params;
  
  // 处理特殊情况，例如华为源和卧龙源
  if (source === 'huawei' && url.includes('m3u.nikanba.live')) {
    url = url.replace('m3u.nikanba.live', 'cos.m3u8hw8.com');
  } else if (source === 'wolong' && url.includes('$')) {
    // 处理卧龙源格式问题
    const parts = url.split('$');
    url = parts.length > 1 ? parts[parts.length - 1] : url;
  }
  
  // 检查是否是直接媒体文件
  const isDirectMedia = url.match(/\.(mp4|avi|mkv|rmvb|flv|mov)$/i);
  
  // 检查是否是已知的直链域名
  const knownDirectDomains = [
    'subokk.com', 'play.subo', 'subo', 
    'cjhwba.com', 'huawei', 
    'jisuzy.com', 'jisu', 
    '360zy', 
    'wolong', 'wolongzyw',
    'mp4.videojs.com'
  ];
  
  const isKnownDirectUrl = knownDirectDomains.some(domain => url.includes(domain));
  
  // 检查是否是M3U8文件
  const isM3u8 = url.toLowerCase().includes('.m3u8');
  
  // 优先检查是否为直接媒体文件，然后检查是否是已知的直链域名
  return isDirectMedia || (isKnownDirectUrl && !isM3u8);
});

// 回退到iframe播放
const fallbackToIframe = (url) => {
  try {
    console.log('切换到iframe播放模式:', url);
    
    // 清理现有的HLS实例
    if (hlsInstance.value) {
      hlsInstance.value.destroy();
      hlsInstance.value = null;
    }
    
    // 检查URL是否可能导致下载
    if (isLikelyDownloadUrl(url)) {
      console.warn('检测到可能导致下载的URL，切换到内置播放器');
      fallbackToNativePlayer(url);
      return;
    }
    
    // 创建iframe元素
    const iframe = document.createElement('iframe');
    
    // 如果URL不是以http开头，可能是相对路径，添加适当的前缀
    if (!url.startsWith('http') && !url.startsWith('//')) {
      url = '//' + url;
    }
    
    // 强制使用HTTPS或相对协议
    if (url.startsWith('http:')) {
      url = url.replace('http:', '//');
    }
    
    iframe.src = url;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.backgroundColor = '#000';
    
    // 添加sandbox属性限制iframe行为，禁止下载
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-presentation';
    
    // 清除当前播放器容器并添加iframe
    const container = document.getElementById('dplayer');
    if (container) {
      container.innerHTML = '';
      container.appendChild(iframe);
      
      // 通知用户
      ElMessage({
        message: '已切换到备用播放模式',
        type: 'info',
        duration: 2000
      });
      
      // 在iframe模式下，提示用户画中画功能不可用
      if (isPipSupported.value) {
        setTimeout(() => {
          ElMessage({
            message: '在当前播放模式下，画中画功能不可用',
            type: 'warning',
            duration: 3000
          });
        }, 2500);
      }
      
      // 清除视频元素引用，避免在iframe模式下尝试画中画
      videoElement.value = null;
    } else {
      throw new Error('找不到播放器容器');
    }
  } catch (error) {
    console.error('回退到iframe失败:', error);
    // 尝试最后的备用方案：原生video元素
    fallbackToNativePlayer(url);
  }
};

// 判断URL是否可能导致下载
const isLikelyDownloadUrl = (url) => {
  // 检查URL是否包含常见的媒体文件扩展名
  const mediaExtensions = /\.(mp4|m4v|mkv|avi|mov|flv|wmv|mpg|mpeg|m3u8|ts)$/i;
  const hasMediaExtension = mediaExtensions.test(url);
  
  // 检查是否包含可能导致下载的关键字
  const downloadKeywords = /(download|attachment|file)/i;
  const hasDownloadKeywords = downloadKeywords.test(url);
  
  // 判断是不是直链媒体（mp4等）
  const isDirectMedia = /\.(mp4|avi|mkv|rmvb|flv|mov)$/i.test(url);
  
  // 如果是直链媒体或者包含下载关键字，可能会触发下载
  return isDirectMedia || hasDownloadKeywords;
};

// 使用原生video播放器作为最后的备用方案
const fallbackToNativePlayer = (url) => {
  try {
    console.log('切换到原生播放器:', url);
    
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.width = '100%';
    video.height = '100%';
    video.style.position = 'absolute';
    video.style.top = '0';
    video.style.left = '0';
    video.style.backgroundColor = '#000';
    
    // 对于m3u8文件，如果浏览器支持HLS，尝试直接播放
    if (url.toLowerCase().includes('.m3u8') && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } 
    // 对于直链媒体文件，直接设置src
    else if (/\.(mp4|webm|ogg)$/i.test(url)) {
      video.src = url;
    } 
    // 对于其他未知格式，使用source元素尝试多种格式
    else {
      const source = document.createElement('source');
      source.src = url;
      source.type = getMediaTypeFromUrl(url);
      video.appendChild(source);
    }
    
    const container = document.getElementById('dplayer');
    if (container) {
      container.innerHTML = '';
      container.appendChild(video);
      
      // 添加播放失败处理
      video.onerror = () => {
        console.error('原生播放器播放失败:', video.error);
        container.innerHTML = `
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background-color:#000; color:#fff; text-align:center; padding:20px;">
            <h3>播放失败</h3>
            <p>当前视频无法播放，请尝试更换播放源或选择其他视频。</p>
            <p style="font-size:12px; margin-top:10px; opacity:0.7;">错误信息: ${video.error ? video.error.message : '未知错误'}</p>
          </div>
        `;
      };
      
      // 添加视频事件监听器，更新视频元素引用
      video.addEventListener('loadedmetadata', () => {
        console.log('原生播放器: 视频元数据已加载');
        videoElement.value = video;
      });
      
      video.addEventListener('play', () => {
        console.log('原生播放器: 视频开始播放');
        videoElement.value = video;
      });
      
      ElMessage({
        message: '已切换到原生播放模式',
        type: 'info',
        duration: 2000
      });
    }
  } catch (videoErr) {
    console.error('原生视频回退失败:', videoErr);
    showPlaybackErrorMessage();
  }
};

// 从URL中猜测媒体类型
const getMediaTypeFromUrl = (url) => {
  if (url.toLowerCase().includes('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (url.toLowerCase().includes('.mp4')) return 'video/mp4';
  if (url.toLowerCase().includes('.webm')) return 'video/webm';
  if (url.toLowerCase().includes('.ogg')) return 'video/ogg';
  if (url.toLowerCase().includes('.ts')) return 'video/mp2t';
  return 'video/mp4'; // 默认为MP4
};

// 显示播放错误信息
const showPlaybackErrorMessage = () => {
  const container = document.getElementById('dplayer');
  if (container) {
    container.innerHTML = `
      <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background-color:#000; color:#fff; text-align:center; padding:20px;">
        <div>
          <h3>播放失败</h3>
          <p>当前视频无法播放，请尝试更换播放源或选择其他视频。</p>
        </div>
      </div>
    `;
    
    ElMessage({
      message: '视频播放失败，请更换播放源',
      type: 'error',
      duration: 3000
    });
  }
};

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
    // ElMessage.error('播放器初始化失败：找不到容器');
    return;
  }

  // 处理华为源中被封锁的域名
  const { source } = route.params;
  let processedUrl = url;
  if (source === 'huawei' && processedUrl.includes('m3u.nikanba.live')) {
    processedUrl = processedUrl.replace('m3u.nikanba.live', 'cos.m3u8hw8.com');
    console.log('播放器初始化 - 华为源域名替换:', processedUrl);
  }

  // 检查是否是需要下载的URL
  if (isLikelyDownloadUrl(processedUrl)) {
    console.log('检测到可能导致下载的媒体文件，使用原生播放器播放:', processedUrl);
    fallbackToNativePlayer(processedUrl);
    return;
  }

  // 使用计算属性检查是否应该使用iframe直接播放
  if (isDirectUrl.value && !isLikelyDownloadUrl(processedUrl)) {
    console.log('检测到直接媒体文件或平台直链，使用iframe直接播放:', processedUrl);
    fallbackToIframe(processedUrl);
    return;
  }

  try {
    console.log('创建新的播放器实例，使用HLS播放器');
    
    const options = {
      container,
      video: {
        url: processedUrl,
        type: 'customHls',
        customType: {
          customHls: function (video, player) {
            setupHlsPlayer(video, processedUrl);
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

    // 监听播放器事件
    player.value.on('error', (error) => {
      console.error('播放器错误:', error);
      fallbackToNativePlayer(processedUrl);
    });

    player.value.on('loadeddata', () => {
      console.log('视频数据加载完成');
      // 视频数据加载完成后更新视频元素引用
      updateVideoElementRef();
    });

    player.value.on('canplay', () => {
      console.log('视频可以播放');
    });

    player.value.on('waiting', () => {
      console.log('视频正在缓冲');
    });

    player.value.on('play', () => {
      console.log('视频开始播放');
      // 视频开始播放后再次更新视频元素引用
      updateVideoElementRef();
    });

  } catch (error) {
    console.error('初始化播放器失败:', error);
    ElMessage.error('初始化播放器失败: ' + error.message);
    fallbackToNativePlayer(processedUrl);
  }
}

// 修改HLS播放器中的错误处理，减少不必要的回退
const setupHlsPlayer = (video, url) => {
  if (!Hls.isSupported()) {
    console.error('浏览器不支持HLS');
    ElMessage.error('您的浏览器不支持HLS播放，尝试切换播放模式');
    fallbackToNativePlayer(url);  // 改用原生播放器而不是iframe
    return null;
  }
  
  const hls = new Hls({
    // HLS配置选项
    maxBufferLength: 60,                // 增加缓冲区长度
    maxMaxBufferLength: 90,             // 增加最大缓冲区长度
    maxBufferSize: 100 * 1000 * 1000,   // 增加到100MB以应对长视频
    maxBufferHole: 1,                   // 增加缓冲区空洞容忍度到1秒
    lowLatencyMode: false,
    // 加载重试配置
    manifestLoadingMaxRetry: 6,         // 增加清单加载重试次数
    levelLoadingMaxRetry: 6,            // 增加级别加载重试次数
    fragLoadingMaxRetry: 6,             // 增加片段加载重试次数
    fragLoadingMaxRetryTimeout: 10000,  // 10秒超时时间
    // 缓冲区空洞处理配置
    highBufferWatchdogPeriod: 3,        // 高缓冲区监控周期（秒）
    nudgeOffset: 0.3,                   // 缓冲区空洞推进偏移量
    nudgeMaxRetry: 10,                  // 最大缓冲区推进尝试次数
    // 增加缓冲容忍度，改善缓冲问题
    maxStarvationDelay: 6,              // 最大饥饿延迟
    maxLoadingDelay: 6,                 // 最大加载延迟
    // 增加ABR（自适应比特率）配置以优化流媒体质量切换
    abrEwmaFastLive: 5.0,
    abrEwmaSlowLive: 9.0,
    abrEwmaDefaultEstimate: 500000,     // 默认带宽估计为500kbps
    startLevel: -1,                     // 自动选择起始清晰度
    // 添加额外的参数来处理视频播放问题
    appendErrorMaxRetry: 5,             // 最大附加错误重试次数
    backBufferLength: 90,               // 90秒的回退缓冲区长度
    liveDurationInfinity: true          // 处理直播流
  });
  
  hlsInstance.value = hls;
  
  // 处理可能被封锁的域名
  let hlsUrl = url;
  const { source } = route.params;
  if (source === 'huawei' && hlsUrl.includes('m3u.nikanba.live')) {
    hlsUrl = hlsUrl.replace('m3u.nikanba.live', 'cos.m3u8hw8.com');
    console.log('HLS加载 - 华为源域名替换:', hlsUrl);
  }

  // 加载资源并附加到视频元素
  hls.loadSource(hlsUrl);
  hls.attachMedia(video);
  
  // 跟踪连续错误次数，用于决定是否需要回退
  let consecutiveErrorCount = 0;
  let bufferHoleErrorCount = 0;
  
  // 设置HLS事件监听
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    console.log('HLS 清单解析完成');
    video.play().catch(error => {
      console.warn('自动播放失败，需要用户交互:', error);
    });
  });
  
  hls.on(Hls.Events.MANIFEST_LOADED, () => {
    console.log('HLS 清单加载完成');
  });
  
  // 监听缓冲事件
  hls.on(Hls.Events.BUFFER_CREATED, () => {
    console.log('HLS 缓冲区创建');
  });
  
  hls.on(Hls.Events.BUFFER_APPENDING, () => {
    console.log('HLS 正在添加缓冲数据');
  });
  
  // 成功播放一段时间后重置错误计数
  hls.on(Hls.Events.FRAG_BUFFERED, () => {
    consecutiveErrorCount = 0;
    bufferHoleErrorCount = 0;
  });
  
  // 错误处理
  hls.on(Hls.Events.ERROR, (event, data) => {
    console.error('HLS 错误类型:', data.type, '详情:', data.details, '致命:', data.fatal);
    
    if (data.fatal) {
      console.error('HLS 致命错误:', data);
      consecutiveErrorCount++;
      
      // 只有在多次致命错误后才考虑回退
      if (consecutiveErrorCount >= 3) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // 网络错误处理
            if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR || 
                data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT ||
                data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR || 
                data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR) {
              console.log('HLS清单加载/解析错误，尝试切换播放模式:', data.details);
              hls.destroy();
              fallbackToNativePlayer(url);  // 改用原生播放器而不是iframe
            } else {
              console.log('网络错误，尝试重新加载:', data.details);
              ElMessage.warning('视频加载出错，正在尝试重新加载...');
              setTimeout(() => {
                hls.startLoad();
              }, 1000);
            }
            break;
            
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('媒体错误，尝试恢复:', data.details);
            ElMessage.warning('视频播放出错，正在尝试恢复...');
            
            // 尝试多次恢复媒体错误
            if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
              // 缓冲卡顿错误
              hls.recoverMediaError();
            } else {
              hls.recoverMediaError();
              // 如果恢复不成功，可以考虑销毁并重新创建
              setTimeout(() => {
                if (player.value && player.value.video) {
                  // 捕获可能的播放错误
                  player.value.video.play().catch(() => {
                    console.log('恢复后播放失败，尝试切换播放模式');
                    hls.destroy();
                    fallbackToNativePlayer(url);  // 改用原生播放器而不是iframe
                  });
                }
              }, 1000);
            }
            break;
            
          default:
            // 其他致命错误，切换到原生播放器
            console.error('无法恢复的HLS错误，切换到原生播放模式');
            hls.destroy();
            fallbackToNativePlayer(url);  // 改用原生播放器而不是iframe
            break;
        }
      } else {
        // 尝试恢复而不是立即回退
        console.log(`第${consecutiveErrorCount}次致命错误，尝试恢复...`);
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setTimeout(() => {
            hls.startLoad();
          }, 1000);
        }
      }
    } else {
      // 非致命错误，记录但继续播放
      console.warn('HLS非致命错误:', data.details);
      
      // 处理缓冲空洞错误 (bufferSeekOverHole) - 这是一个常见的非致命错误
      if (data.details === Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE) {
        /* 
         * bufferSeekOverHole 错误详解:
         * 这个错误表示HLS播放器在视频播放时遇到了"缓冲区空洞"，即播放时间轴上存在一段没有数据的区域。
         * 通常原因包括:
         * 1. 网络波动导致某些视频片段加载失败或丢失
         * 2. CDN服务质量问题，某些片段被损坏或无法访问
         * 3. 视频源本身的问题，片段不连续
         * 
         * 这是一个非致命错误，HLS.js会尝试自动跳过这个空洞继续播放。
         * 如果看到这个错误但播放正常，通常不需要担心。
         * 如果反复出现，可能会导致播放卡顿。
         */
        const holeSize = data.hole || '未知';
        console.log(`检测到视频缓冲空洞，大小: ${holeSize} 秒。这通常是由网络波动或视频源问题导致的，播放器会尝试自动跳过这个区域。`);
        
        bufferHoleErrorCount++;
        
        // 只有当缓冲空洞错误频繁出现才降低清晰度
        if (bufferHoleErrorCount > 5 && hls.autoLevelEnabled && hls.currentLevel > 0) {
          const currentLevelCount = hls.currentLevel;
          const levels = hls.levels;
          if (levels && levels.length > 1 && currentLevelCount > 0) {
            console.log('检测到多次缓冲问题，尝试切换到较低清晰度以改善播放体验');
            // 切换到低一级的清晰度
            hls.nextLevel = currentLevelCount - 1;
          }
        }
        
        // 尝试主动修复缓冲问题
        if (bufferHoleErrorCount > 10) {
          console.log('缓冲空洞问题持续出现，尝试主动修复...');
          // 重置当前缓冲区
          video.currentTime = video.currentTime + 0.1;
        }
      }
      // 如果是自动级别切换失败，可以尝试手动设置级别
      else if (data.details === Hls.ErrorDetails.LEVEL_SWITCH_ERROR) {
        const currentLevel = hls.currentLevel;
        const levels = hls.levels;
        if (levels && levels.length > 1 && currentLevel > 0) {
          console.log('切换清晰度失败，尝试切换到较低清晰度');
          hls.currentLevel = currentLevel - 1;
        }
      }
      // 如果长时间处于缓冲状态，尝试恢复
      else if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
        console.log('视频缓冲卡顿，尝试恢复播放');
        // 尝试轻度恢复（不会完全重置播放器）
        if (video.paused) {
          video.play().catch(e => console.warn('恢复播放失败:', e));
        } else {
          // 如果视频已在播放，尝试轻微跳过当前位置
          const currentTime = video.currentTime;
          video.currentTime = currentTime + 0.1;
        }
      }
      // 对于其他非致命错误，大多数情况下HLS.js会自行处理
    }
  });
  
  // 添加视频元素的事件监听，增强错误处理
  video.addEventListener('stalled', () => {
    console.log('视频卡顿 (stalled event)');
    // 如果卡顿超过一定时间，可以考虑重新加载或降低清晰度
  });
  
  video.addEventListener('waiting', () => {
    console.log('视频等待加载 (waiting event)');
  });
  
  video.addEventListener('error', (e) => {
    console.error('视频元素错误:', e);
    if (hls) {
      // 尝试重新加载视频
      hls.stopLoad();
      setTimeout(() => {
        hls.startLoad();
        video.play().catch(err => console.warn('重新播放失败:', err));
      }, 1000);
    }
  });
  
  return hls;
};

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
    
    // 设置当前播放源
    // 修复当播放源是默认源或heimuer时的处理
    if (!source || source === 'heimuer') {
      currentSource.value = 'api';  // 使用'api'作为黑木耳的值
    } else {
      currentSource.value = source;
    }
    
    if (!id) {
      throw new Error('视频ID不能为空');
    }
    
    // 根据播放源选择不同的API端点
    let apiEndpoint = '/api';
    let sourceName = '黑木耳';  // 修改默认源的显示名称
    
    if (source === 'ikun') {
      apiEndpoint = '/ikun';
      sourceName = '爱坤';
    } else if (source === 'subo') {
      apiEndpoint = '/subo';
      sourceName = '速播';
    } else if (source === 'huawei') {
      apiEndpoint = '/huawei';
      sourceName = '华为';
    } else if (source === 'jisu') {
      apiEndpoint = '/jisu';
      sourceName = '急速';
    } else if (source === '360') {
      apiEndpoint = '/360';
      sourceName = '360';
    } else if (source === 'wolong') {
      apiEndpoint = '/wolong';
      sourceName = '卧龙';
    }
    
    console.log(`使用${sourceName}API端点获取数据, 影片ID:`, id);
    
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
        const parts = item.split('$');
        let name = parts[0]?.trim() || `第${index + 1}集`;
        let url = parts.length > 1 ? parts[1]?.trim() : '';
        
        // 特殊处理卧龙源，有时URL可能在name部分
        if (source === 'wolong' && !url && parts[0]?.includes('http')) {
          const lastDollarIndex = item.lastIndexOf('$');
          if (lastDollarIndex !== -1) {
            name = item.substring(0, lastDollarIndex).trim();
            url = item.substring(lastDollarIndex + 1).trim();
          } else {
            name = `第${index + 1}集`;
            url = parts[0].trim();
          }
        }
        
        return {
          name: name || `第${index + 1}集`,
          url: url || '',
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

// 添加键盘事件处理函数
const handleKeyDown = (event) => {
  // 检查按键是否为 'p' 键（画中画快捷键）
  if (event.key === 'p' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    togglePictureInPicture()
  }
}

// 组件挂载时初始化
onMounted(() => {
  historyStore.loadFromLocal()
  loadVideoInfo()
  checkPipSupport() // 检查画中画支持
  checkShouldShowPipTip() // 检查是否应该显示画中画提示
  
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown)
})

// 组件销毁时清理
onBeforeUnmount(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeyDown)
  
  cleanupPlayer()
})

// 监听路由参数变化
watch(() => route.params, (newParams) => {
  if (newParams.id && newParams.episode) {
    cleanupPlayer() // 在路由变化时清理资源
    loadVideoInfo()
  }
}, { deep: true })

// 在player初始化后更新视频元素引用
watch(player, (newPlayer) => {
  if (newPlayer) {
    updateVideoElementRef()
  }
})

// 监听视频替换，更新视频元素引用
watch(() => route.params.episode, () => {
  updateVideoElementRef()
})
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
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
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
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  background-color: #000;
}

#dplayer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.player-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1002; /* 确保控件在视频播放器之上 */
}

.pip-button {
  background-color: rgba(0, 0, 0, 0.5) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 5px 10px !important;
  font-size: 12px !important;
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  transition: all 0.3s ease !important;
  opacity: 0.7;
}

.pip-button:hover {
  opacity: 1;
  background-color: rgba(64, 158, 255, 0.8) !important;
}

.pip-button:disabled {
  background-color: rgba(0, 0, 0, 0.3) !important;
  color: rgba(255, 255, 255, 0.5) !important;
  cursor: not-allowed !important;
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

.controls-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.source-select {
  min-width: 120px;
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
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .controls-row {
    width: 100%;
    justify-content: space-between;
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

  .pip-button {
    padding: 4px 8px !important;
    font-size: 10px !important;
  }
  
  .player-controls {
    top: 5px;
    right: 5px;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .episode-list {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }
}

.pip-tip {
  margin: 10px auto;
  max-width: 1200px;
}

.pip-alert {
  background-color: rgba(64, 158, 255, 0.1) !important;
  border-color: rgba(64, 158, 255, 0.3) !important;
}

.dark-theme .pip-alert {
  background-color: rgba(64, 158, 255, 0.15) !important;
  border-color: rgba(64, 158, 255, 0.4) !important;
  color: #d0d0d0 !important;
}
</style> 