<template>
  <div class="video-detail-page">
    <div class="back-button-container">
      <el-button @click="goBack" class="back-button">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
    </div>
    <div v-if="loading" class="loading-container">
      <div class="custom-loader">
        <div class="loader-wave">
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
        </div>
        <div class="loader-text">正在加载详情...</div>
      </div>
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
      <!-- 源加载中的状态显示 -->
      <div v-if="currentSourceLoading" class="source-loading-mask">
        <div class="source-loading-content">
          <el-icon class="is-loading source-loading-icon"><Loading /></el-icon>
          <span>加载播放源信息中...</span>
        </div>
      </div>
      
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
            <el-button 
              type="primary" 
              @click="startPlay" 
              v-if="playLists.length > 0"
              :disabled="!currentPlaySource || !currentPlaySource.episodes || currentPlaySource.episodes.length === 0"
            >
              <el-icon class="button-icon"><VideoPlay /></el-icon>
              <span class="button-text">{{ getPlayButtonText() }}</span>
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
            <el-dropdown trigger="click" class="share-dropdown">
              <el-button type="warning">
                <el-icon class="button-icon"><Share /></el-icon>
                <span class="button-text">分享</span>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="shareToWeChat">
                    <div class="share-item">
                      <i class="fa-brands fa-weixin share-icon" style="color: #07C160;"></i>
                      <span class="share-text">微信</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="shareToWeibo">
                    <div class="share-item">
                      <i class="fa-brands fa-weibo share-icon" style="color: #E6162D;"></i>
                      <span class="share-text">微博</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="shareToQQ">
                    <div class="share-item">
                      <i class="fa-brands fa-qq share-icon" style="color: #12B7F5;"></i>
                      <span class="share-text">QQ</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="generatePosterShare">
                    <div class="share-item">
                      <i class="fa-solid fa-image share-icon" style="color: #8A2BE2;"></i>
                      <span class="share-text">海报分享</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="copyShareLink">
                    <div class="share-item">
                      <i class="fa-solid fa-link share-icon" style="color: blue;"></i>
                      <span class="share-text">复制链接</span>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
      
      <div class="video-play-section" v-if="playLists.length > 0">
        <div class="source">
          <div class="source-header">
            <div class="source-title">播放源</div>
            <el-select v-model="activePlaySource" class="source-select" placeholder="请选择播放源">
              <el-option
                v-for="(playList, index) in playLists"
                :key="playList.sourceKey || index"
                :label="playList.source"
                :value="playList.source"
              >
                <div class="source-option-label">
                  <el-icon>
                    <component :is="getSourceIcon(playList.sourceKey || playList.source)" />
                  </el-icon>
                  <span>{{ playList.source }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
          
          <div v-if="currentPlaySource" class="episode-container">
            <div class="section-title">
              选集播放
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
            <div class="episode-grid">
              <el-button
                v-for="(episode, index) in getSortedEpisodes(currentPlaySource.episodes)"
                :key="episode.url || index"
                :class="{ 'is-active': activeEpisode === episode.url }"
                @click="playEpisode(currentPlaySource.source, episode.url, episode.index)"
                size="small"
              >
                {{ episode.name }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="video-description" v-if="videoInfo.vod_content">
        <div class="section-title">剧情简介</div>
        <div class="description-content" v-html="formatContent(videoInfo.vod_content)"></div>
      </div>
    </div>
    
    <!-- 微信分享二维码弹窗 -->
    <el-dialog
      v-model="qrCodeDialogVisible"
      title="微信扫码分享"
      width="300px"
      center
    >
      <div class="qrcode-content" ref="qrCodeContainer">
        <qrcode-vue 
          :value="currentPageUrl" 
          :size="200" 
          level="H" 
          render-as="canvas"
        ></qrcode-vue>
        <p class="qrcode-tip">请使用微信"扫一扫"扫描二维码</p>
        <el-button type="primary" @click="downloadQRCode" style="margin-top: 10px;">
          <el-icon class="button-icon"><Download /></el-icon>
          下载二维码
        </el-button>
      </div>
    </el-dialog>

    <!-- 海报分享弹窗 -->
    <el-dialog
      v-model="posterDialogVisible"
      title="海报分享"
      width="350px"
      center
    >
      <div class="poster-content" ref="posterContainer">
        <div class="share-poster">
          <div class="poster-header">
            <img :src="videoInfo?.vod_pic || '/src/assets/default-poster.svg'" class="poster-image" />
            <div class="poster-info">
              <div class="title-with-rating">
                <h2 class="poster-title">{{ videoInfo?.vod_name }}</h2>
                <div class="poster-score" v-if="videoInfo?.vod_score">
                  <span class="score-value">{{ videoInfo.vod_score }}</span>
                  <span class="score-text"></span>
                </div>
              </div>
              <div class="poster-meta">
                <div v-if="videoInfo?.vod_year">{{ videoInfo.vod_year }}</div>
                <div v-if="videoInfo?.vod_area">{{ videoInfo.vod_area }}</div>
                <div v-if="videoInfo?.type_name">{{ videoInfo.type_name }}</div>                
                <div v-if="videoInfo?.vod_remarks">{{ videoInfo.vod_remarks }}</div>
                <div v-if="videoInfo?.vod_actor">{{ videoInfo.vod_actor }}</div>
                <!-- <div v-if="videoInfo?.vod_director">{{ videoInfo.vod_director }}</div> -->
              </div>
            </div>
          </div>
          <div class="poster-desc" v-if="videoInfo?.vod_content">
            {{ videoInfo.vod_content.substring(0, 100) }}{{ videoInfo.vod_content.length > 100 ? '...' : '' }}
          </div>
          <div class="poster-footer">
            <qrcode-vue 
              :value="currentPageUrl" 
              :size="80" 
              level="M" 
              render-as="canvas"
            ></qrcode-vue>
            <div class="poster-qr-tip">
              <div>扫码观看</div>
              <div>SSNG TV - 在线影视网站</div>
            </div>
          </div>
        </div>
        <el-button type="primary" @click="downloadPoster" style="margin-top: 15px; width: 100%;">
          <el-icon class="button-icon"><Download /></el-icon>
          下载海报
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { VideoPlay, Star, SortUp, SortDown, Back, Loading, VideoCamera, Download, Monitor, Film, Cellphone, VideoCameraFilled, Share } from '@element-plus/icons-vue'
import { useHistoryStore } from '../stores/history'
import { useFavoriteStore } from '../stores/favorite'
import QrcodeVue from 'qrcode.vue';
import html2canvas from 'html2canvas';

// 从路由参数中获取视频ID
const route = useRoute();
const router = useRouter();
const videoId = ref(route.params.id);

// 数据状态
const loading = ref(false);
const error = ref(null);
const videoInfo = ref(null);
const originalVideoInfo = ref(null); // 保存原始影片信息
const activePlaySource = ref('');
const activeEpisode = ref('');
const currentPlayUrl = ref('');
const currentSourceLoading = ref(false); // 当前源加载状态

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
      // type: getVideoType(),
      type: videoInfo.value.type_name,
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
// function getVideoType() {
//   // 从URL中提取类型
//   const pathParts = route.path.split('/')
//   console.log('路径部分:', pathParts);
//   const type = pathParts[0] // 例如 /tv/detail/... 中的 tv
//   console.log('视频类型:', type);
//   return type || 'video'
// }

// 播放指定剧集
function playEpisode(source, url, index) {
  // 获取当前选中的播放源信息
  const currentSource = playLists.value.find(s => s.source === source);
  if (!currentSource) return;
  
  // 获取正确的ID
  let sourceId = videoInfo.value.vod_id;
  
  // 如果当前显示的是爱坤信息，但要播放的是其他源，恢复原始ID
  if (videoInfo.value._source === '爱坤' && currentSource.source !== '爱坤') {
    sourceId = originalVideoInfo.value.vod_id;
  }
  
  // 如果当前显示的不是爱坤信息，但要播放的是爱坤源，使用爱坤的ID
  if (ikunDetailInfo.value && currentSource.source === '爱坤') {
    sourceId = ikunDetailInfo.value.vod_id;
  }
  
  // 如果是速播源，使用速播源的影片ID
  if (currentSource.sourceKey === 'subo' && suboDetailInfo.value) {
    sourceId = suboDetailInfo.value.vod_id;
    console.log('使用速播源影片ID:', sourceId);
  }
  
  // 如果是华为源，使用华为源的影片ID
  if (currentSource.sourceKey === 'huawei' && huaweiDetailInfo.value) {
    sourceId = huaweiDetailInfo.value.vod_id;
    console.log('使用华为源影片ID:', sourceId);
  }
  
  // 如果是急速源，使用急速源的影片ID
  if (currentSource.sourceKey === 'jisu' && jisuDetailInfo.value) {
    sourceId = jisuDetailInfo.value.vod_id;
    console.log('使用急速源影片ID:', sourceId);
  }
  
  // 如果是360源，使用360源的影片ID
  if (currentSource.sourceKey === '360' && videozy360DetailInfo.value) {
    sourceId = videozy360DetailInfo.value.vod_id;
    console.log('使用360源影片ID:', sourceId);
  }
  
  // 如果是卧龙源，使用卧龙源的影片ID
  if (currentSource.sourceKey === 'wolong' && wolongDetailInfo.value) {
    sourceId = wolongDetailInfo.value.vod_id;
    console.log('使用卧龙源影片ID:', sourceId);
  }
  
  // 统一使用内部播放页面
  router.push(`/play/${sourceId}/${index + 1}/${currentSource.sourceKey}`);
}

// 获取当前选中的播放源
const currentPlaySource = computed(() => {
  return playLists.value.find(source => source.source === activePlaySource.value);
});

// 获取播放按钮文本，基于当前选择的播放源
function getPlayButtonText() {
  if (playLists.value.length === 0) return '立即播放';
  
  if (!currentPlaySource.value) return '立即播放';
  
  // 如果当前源没有可用剧集，显示状态信息
  if (!currentPlaySource.value.episodes || currentPlaySource.value.episodes.length === 0) {
    return `${currentPlaySource.value.source}(无可用剧集)`;
  }
  
  return `播放【${currentPlaySource.value.source}】`;
}

// 开始播放第一集
function startPlay() {
  if (playLists.value.length > 0) {
    // 使用当前选中的播放源，而不是默认的第一个播放源
    const sourceToPlay = currentPlaySource.value || playLists.value[0];
    
    if (sourceToPlay && sourceToPlay.episodes && sourceToPlay.episodes.length > 0) {
      const firstEpisode = sourceToPlay.episodes[0];
      console.log(`立即播放: 使用 ${sourceToPlay.source} 源的第一集`);
      
      // 获取正确的ID
      let sourceId = videoInfo.value.vod_id;
      
      // 如果当前显示的是爱坤信息，但要播放的是其他源，恢复原始ID
      if (videoInfo.value._source === '爱坤' && sourceToPlay.source !== '爱坤') {
        sourceId = originalVideoInfo.value.vod_id;
      }
      
      // 如果当前显示的不是爱坤信息，但要播放的是爱坤源，使用爱坤的ID
      if (ikunDetailInfo.value && sourceToPlay.source === '爱坤') {
        sourceId = ikunDetailInfo.value.vod_id;
      }
      
      // 如果是速播源，使用速播源的影片ID
      if (sourceToPlay.sourceKey === 'subo' && suboDetailInfo.value) {
        sourceId = suboDetailInfo.value.vod_id;
        console.log('使用速播源影片ID:', sourceId);
      }
      
      // 如果是华为源，使用华为源的影片ID
      if (sourceToPlay.sourceKey === 'huawei' && huaweiDetailInfo.value) {
        sourceId = huaweiDetailInfo.value.vod_id;
        console.log('使用华为源影片ID:', sourceId);
      }
      
      // 如果是急速源，使用急速源的影片ID
      if (sourceToPlay.sourceKey === 'jisu' && jisuDetailInfo.value) {
        sourceId = jisuDetailInfo.value.vod_id;
        console.log('使用急速源影片ID:', sourceId);
      }
      
      // 如果是360源，使用360源的影片ID
      if (sourceToPlay.sourceKey === '360' && videozy360DetailInfo.value) {
        sourceId = videozy360DetailInfo.value.vod_id;
        console.log('使用360源影片ID:', sourceId);
      }
      
      // 如果是卧龙源，使用卧龙源的影片ID
      if (sourceToPlay.sourceKey === 'wolong' && wolongDetailInfo.value) {
        sourceId = wolongDetailInfo.value.vod_id;
        console.log('使用卧龙源影片ID:', sourceId);
      }
      
      // 统一使用内部播放页面
      router.push(`/play/${sourceId}/1/${sourceToPlay.sourceKey}`);
    } else {
      console.log(`立即播放: ${sourceToPlay.source} 源没有可用剧集`);
      ElMessage.warning('当前播放源没有可用剧集');
    }
  } else {
    console.log('立即播放: 没有可用播放源');
    ElMessage.warning('没有可用播放源');
  }
}

// 播放列表
const playLists = computed(() => {
  const lists = [];
  
  // 添加默认的 heimuer 播放源
  if (videoInfo.value && videoInfo.value.vod_play_from && videoInfo.value.vod_play_url) {
    const playFrom = videoInfo.value.vod_play_from.split(',');
    const playUrl = videoInfo.value.vod_play_url.split(',');
    
    playFrom.forEach((source, index) => {
      const urlList = playUrl[index] ? playUrl[index].split('#') : [];
      
      if (urlList.length > 0) {
        // 处理各种源的显示名称
        const sourceName = source.trim();
        let displayName = sourceName;
        
        // 黑木耳源特殊处理
        if (sourceName === 'heimuer' || sourceName === 'ikm3u8') {
          displayName = '黑木耳';
        } 
        // 速播源特殊处理
        else if (sourceName.includes('subyun') || sourceName.includes('subm3u8') || 
                sourceName.includes('subo') || sourceName === 'sub') {
          displayName = '速播';
        }
        // 急速源特殊处理
        else if (sourceName.includes('jisu') || sourceName.includes('jisuyun') || 
                sourceName.includes('jism3u8')) {
          displayName = '急速';
        }
        // 360源特殊处理
        else if (sourceName.includes('360') || sourceName.includes('360m3u8') ||
                sourceName.includes('360yun')) {
          displayName = '360';
        }
        // 华为源特殊处理
        else if (sourceName.includes('huawei') || sourceName.includes('huaweiyun') ||
                sourceName.includes('huaweim3u8') || sourceName === 'huawei') {
          displayName = '华为';
        }
        
        lists.push({
          source: displayName, // 显示名称
          sourceKey: sourceName, // 保留原始的键名，用于路由跳转
          episodes: urlList.map((item, episodeIndex) => {
            const [name, url] = item.split('$');
            return {
              name: name?.trim() || `第${episodeIndex + 1}集`,
              url: url?.trim() || '',
              index: episodeIndex
            };
          }).filter(episode => episode.url)
        });
      }
    });
  }
  
  // 添加爱坤播放源
  if (videoInfo.value && ikunPlayList.value.length > 0) {
    lists.push({
      source: '爱坤',
      sourceKey: 'ikun', // 添加sourceKey用于识别
      episodes: ikunPlayList.value.map((episode, index) => {
        return {
          name: episode.name || `第${index + 1}集`,
          url: episode.url || '',
          index: index
        };
      })
    });
  }

  // 添加速播播放源
  if (videoInfo.value && suboPlayList.value.length > 0) {
    // 检查是否已经有速播源，避免重复添加
    const hasSuBoSource = lists.some(list => list.source === '速播');
    
    if (!hasSuBoSource) {
      lists.push({
        source: '速播',
        sourceKey: 'subo', // 添加sourceKey用于识别
        episodes: suboPlayList.value.map((episode, index) => {
          return {
            name: episode.name || `第${index + 1}集`,
            url: episode.url || '',
            index: index,
            id: episode.id || (suboDetailInfo.value ? suboDetailInfo.value.vod_id : null)
          };
        })
      });
    }
  }
  
  // 添加华为播放源
  if (videoInfo.value && huaweiPlayList.value.length > 0) {
    // 检查是否已经有华为源，避免重复添加
    const hasHuaweiSource = lists.some(list => list.source === '华为');
    
    if (!hasHuaweiSource) {
      lists.push({
        source: '华为',
        sourceKey: 'huawei', // 添加sourceKey用于识别
        episodes: huaweiPlayList.value.map((episode, index) => {
          return {
            name: episode.name || `第${index + 1}集`,
            url: episode.url || '',
            index: index,
            id: episode.id || (huaweiDetailInfo.value ? huaweiDetailInfo.value.vod_id : null)
          };
        })
      });
    }
  }
  
  // 添加急速播放源
  if (videoInfo.value && jisuPlayList.value.length > 0) {
    // 检查是否已经有急速源，避免重复添加
    const hasJisuSource = lists.some(list => list.source === '急速');
    
    if (!hasJisuSource) {
      lists.push({
        source: '急速',
        sourceKey: 'jisu', // 添加sourceKey用于识别
        episodes: jisuPlayList.value.map((episode, index) => {
          return {
            name: episode.name || `第${index + 1}集`,
            url: episode.url || '',
            index: index,
            id: episode.id || (jisuDetailInfo.value ? jisuDetailInfo.value.vod_id : null)
          };
        })
      });
    }
  }
  
  // 添加360播放源
  if (videoInfo.value && videozy360PlayList.value.length > 0) {
    // 检查是否已经有360源，避免重复添加
    const has360Source = lists.some(list => list.source === '360');
    
    if (!has360Source) {
      lists.push({
        source: '360',
        sourceKey: '360', // 添加sourceKey用于识别
        episodes: videozy360PlayList.value.map((episode, index) => {
          return {
            name: episode.name || `第${index + 1}集`,
            url: episode.url || '',
            index: index,
            id: episode.id || (videozy360DetailInfo.value ? videozy360DetailInfo.value.vod_id : null)
          };
        })
      });
    }
  }
  
  // 添加卧龙播放源
  if (videoInfo.value && wolongPlayList.value.length > 0) {
    // 检查是否已经有卧龙源，避免重复添加
    const hasWolongSource = lists.some(list => list.source === '卧龙');
    
    if (!hasWolongSource) {
      lists.push({
        source: '卧龙',
        sourceKey: 'wolong', // 添加sourceKey用于识别
        episodes: wolongPlayList.value.map((episode, index) => {
          return {
            name: episode.name || `第${index + 1}集`,
            url: episode.url || '',
            index: index,
            id: episode.id || (wolongDetailInfo.value ? wolongDetailInfo.value.vod_id : null)
          };
        })
      });
    }
  }
  
  return lists;
});

// 爱坤播放源的数据
const ikunPlayList = ref([]);
const ikunLoading = ref(false);
const ikunLoaded = ref(false);
const ikunDetailInfo = ref(null); // 存储爱坤源的详细信息

// 速播播放源的数据
const suboPlayList = ref([]);
const suboLoading = ref(false);
const suboLoaded = ref(false);
const suboDetailInfo = ref(null); // 存储速播源的详细信息

// 华为播放源的数据
const huaweiPlayList = ref([]);
const huaweiLoading = ref(false);
const huaweiLoaded = ref(false);
const huaweiDetailInfo = ref(null); // 存储华为源的详细信息

// 急速播放源的数据
const jisuPlayList = ref([]);
const jisuLoading = ref(false);
const jisuLoaded = ref(false);
const jisuDetailInfo = ref(null); // 存储急速源的详细信息

// 360播放源的数据
const videozy360PlayList = ref([]);
const videozy360Loading = ref(false);
const videozy360Loaded = ref(false);
const videozy360DetailInfo = ref(null); // 存储360源的详细信息

// 卧龙播放源的数据
const wolongPlayList = ref([]);
const wolongLoading = ref(false);
const wolongLoaded = ref(false);
const wolongDetailInfo = ref(null); // 存储卧龙源的详细信息

// 监听播放源变化
watch(() => route.query.source, async (newSource) => {
  if (newSource && playLists.value.length > 0) {
    console.log('URL中的播放源:', newSource);
    
    // 根据URL中的source参数选择对应的播放源
    const sourceMap = {
      'api': '黑木耳',
      'ikun': '爱坤',
      'wolong': '卧龙',
      '360': '360',
      'huawei': '华为',
      'jisu': '急速',
      'subo': '速播'
    };
    
    const sourceName = sourceMap[newSource];
    console.log('映射后的播放源名称:', sourceName);
    
    // 查找匹配的播放源
    const sourceFromUrlExists = playLists.value.find(source => {
      console.log('检查播放源:', source.source, source.sourceKey);
      return (
        source.source === sourceName || 
        source.sourceKey === newSource || 
        (source.sourceKey === 'subo' && sourceName === '速播') ||
        (source.sourceKey === 'huawei' && sourceName === '华为') ||
        (source.sourceKey === 'huawei' && newSource === 'huawei')
      );
    });
    
    if (sourceFromUrlExists) {
      console.log('找到匹配的播放源:', sourceFromUrlExists.source);
      activePlaySource.value = sourceFromUrlExists.source;
    } else {
      console.log('指定的播放源不存在，使用默认播放源');
      // 如果指定的播放源不存在，使用默认逻辑
      const heimuerSource = playLists.value.find(source => 
        source.source === '黑木耳' || source.sourceKey === 'heimuer' || source.sourceKey === 'ikm3u8'
      );
      
      if (heimuerSource) {
        activePlaySource.value = heimuerSource.source;
      } else {
        activePlaySource.value = playLists.value[0].source;
      }
    }
  }
}, { immediate: true });

// 监听播放源变化
watch(() => activePlaySource.value, async (newSource, oldSource) => {
  if (!newSource || !videoInfo.value) return;
  
  console.log(`播放源切换: ${oldSource} -> ${newSource}`); // 添加日志，便于调试
  
  // 强制刷新一下，确保 DOM 更新
  await nextTick();
  
  // 查找当前选中的播放源
  const currentSource = playLists.value.find(source => source.source === newSource);
  if (!currentSource) {
    console.log('未找到当前播放源:', newSource);
    return;
  }
  
  // 在切换源时先重置选集状态
  activeEpisode.value = '';
  currentPlayUrl.value = '';
  
  // 根据不同的播放源类型获取影片信息
  if (currentSource.sourceKey === 'ikun' && !ikunLoaded.value) {
    // 如果是爱坤源，则获取详细信息
    currentSourceLoading.value = true;
    try {
      await fetchIkunSource();
      
      // 更新UI显示
      if (ikunDetailInfo.value) {
        updateIkunDetailDisplay();
      }
    } catch (error) {
      console.error('切换到爱坤源时出错:', error);
    } finally {
      currentSourceLoading.value = false;
      // 刷新DOM以确保内容显示
      await nextTick();
    }
  } else if (currentSource.sourceKey === 'subo' && !suboLoaded.value) {
    // 如果是速播源，则获取详细信息
    currentSourceLoading.value = true;
    try {
      await fetchSuboSource();
      
      // 更新UI显示
      if (suboDetailInfo.value) {
        updateSuboDetailDisplay();
      }
    } catch (error) {
      console.error('切换到速播源时出错:', error);
    } finally {
      currentSourceLoading.value = false;
      // 刷新DOM以确保内容显示
      await nextTick();
    }
  } else if (currentSource.sourceKey === 'huawei' && !huaweiLoaded.value) {
    // 如果是华为源，则获取详细信息
    currentSourceLoading.value = true;
    try {
      await fetchHuaweiSource();
      
      // 更新UI显示
      if (huaweiDetailInfo.value) {
        updateHuaweiDetailDisplay();
      }
    } catch (error) {
      console.error('切换到华为源时出错:', error);
    } finally {
      currentSourceLoading.value = false;
      // 刷新DOM以确保内容显示
      await nextTick();
    }
  } else if (currentSource.sourceKey === 'jisu' && !jisuLoaded.value) {
    // 如果是急速源，则获取详细信息
    currentSourceLoading.value = true;
    try {
      await fetchJisuSource();
      
      // 更新UI显示
      if (jisuDetailInfo.value) {
        updateJisuDetailDisplay();
      }
    } catch (error) {
      console.error('切换到急速源时出错:', error);
    } finally {
      currentSourceLoading.value = false;
      // 刷新DOM以确保内容显示
      await nextTick();
    }
  } else if (currentSource.sourceKey === '360' && !videozy360Loaded.value) {
    // 如果是360源，则获取详细信息
    currentSourceLoading.value = true;
    try {
      await fetch360Source();
      
      // 更新UI显示
      if (videozy360DetailInfo.value) {
        update360DetailDisplay();
      }
    } catch (error) {
      console.error('切换到360源时出错:', error);
    } finally {
      currentSourceLoading.value = false;
      // 刷新DOM以确保内容显示
      await nextTick();
    }
  } else if (currentSource.sourceKey === 'wolong' && !wolongLoaded.value) {
    // 如果是卧龙源，则获取详细信息
    currentSourceLoading.value = true;
    try {
      await fetchWolongSource();
      
      // 更新UI显示
      if (wolongDetailInfo.value) {
        updateWolongDetailDisplay();
      }
    } catch (error) {
      console.error('切换到卧龙源时出错:', error);
    } finally {
      currentSourceLoading.value = false;
      // 刷新DOM以确保内容显示
      await nextTick();
    }
  } else {
    // 已加载过的源不需要再次加载
    if (currentSource.sourceKey === 'ikun' && ikunDetailInfo.value) {
      updateIkunDetailDisplay();
    } else if (currentSource.sourceKey === 'subo' && suboDetailInfo.value) {
      updateSuboDetailDisplay();
    } else if (currentSource.sourceKey === 'huawei' && huaweiDetailInfo.value) {
      updateHuaweiDetailDisplay();
    } else if (currentSource.sourceKey === 'jisu' && jisuDetailInfo.value) {
      updateJisuDetailDisplay();
    } else if (currentSource.sourceKey === '360' && videozy360DetailInfo.value) {
      update360DetailDisplay();
    } else if (currentSource.sourceKey === 'wolong' && wolongDetailInfo.value) {
      updateWolongDetailDisplay();
    } else if (videoInfo.value._source) {
      // 如果是从特殊源切换回普通源，恢复原始数据
      console.log('从特殊源切换回普通源，恢复原始数据');
      if (originalVideoInfo.value) {
        videoInfo.value = { ...originalVideoInfo.value };
      }
    }
  }
  
  // 强制触发playLists的重新计算
  await nextTick();
  
  // 无论是哪种源，都确保选择第一集
  const updatedSource = playLists.value.find(source => source.source === newSource);
  if (updatedSource && updatedSource.episodes && updatedSource.episodes.length > 0) {
    console.log(`选择第一集，当前源 ${newSource} 的剧集数: ${updatedSource.episodes.length}`);
    const firstEpisodeUrl = updatedSource.episodes[0].url;
    activeEpisode.value = firstEpisodeUrl;
  }
});

// 更新爱坤详情信息到UI
const updateIkunDetailDisplay = () => {
  if (!ikunDetailInfo.value || !originalVideoInfo.value) return;
  
  // 更新展示的影片信息，但保留原始ID等关键信息
  const originalId = originalVideoInfo.value.vod_id;
  const originalType = originalVideoInfo.value.type_id;
  
  // 保留原始的播放源信息
  const originalPlayFrom = originalVideoInfo.value.vod_play_from;
  const originalPlayUrl = originalVideoInfo.value.vod_play_url;
  
  // 临时存储详细信息，与原始信息合并
  const detailInfo = {
    ...ikunDetailInfo.value,
    vod_id: originalId, // 保留原始ID
    type_id: originalType, // 保留原始类型
    _source: '爱坤', // 标记来源
    vod_play_from: originalPlayFrom, // 保留原始播放源信息
    vod_play_url: originalPlayUrl, // 保留原始播放URL信息
  };
  
  // 更新视图上的信息
  videoInfo.value = detailInfo;
};

// 获取匹配的爱坤影片
async function getIkunMatchedMovie() {
  if (!videoInfo.value || !videoInfo.value.vod_name) {
    console.log('没有原始影片信息，无法查找爱坤匹配影片');
    return null;
  }
  
  try {
    // 使用名称搜索爱坤API
    const searchName = videoInfo.value.vod_name.trim();
    console.log('使用名称搜索爱坤匹配影片:', searchName);
    
    // 使用带超时和重试的请求
    const response = await requestWithRetry(
      () => axios.get(`/ikun/api.php/provide/vod/`, {
        params: {
          ac: 'list',
          wd: searchName
        }
      }),
      2, // 最多重试2次
      10000, // 10秒超时
      '爱坤搜索请求超时'
    );
    
    const result = response.data;
    
    if (result && result.code === 1 && result.list && result.list.length > 0) {
      console.log(`爱坤搜索到 ${result.list.length} 条结果`);
      
      // 尝试找到完全匹配的影片
      let exactMatch = result.list.find(item => item.vod_name === searchName);
      
      if (exactMatch) {
        console.log('找到精确匹配的爱坤影片:', exactMatch.vod_name);
        return exactMatch;
      }
      
      // 如果没有完全匹配，尝试找到包含原始名称的影片
      const partialMatches = result.list.filter(item => 
        item.vod_name.includes(searchName) || searchName.includes(item.vod_name)
      );
      
      if (partialMatches.length > 0) {
        // 如果有多个结果，选择名称最接近的那个
        const bestMatch = partialMatches.reduce((best, current) => {
          const bestDiff = Math.abs(best.vod_name.length - searchName.length);
          const currentDiff = Math.abs(current.vod_name.length - searchName.length);
          return currentDiff < bestDiff ? current : best;
        }, partialMatches[0]);
        
        console.log('找到最佳匹配的爱坤影片:', bestMatch.vod_name);
        return bestMatch;
      }
      
      // 如果仍然没有合适的匹配，返回第一个结果
      console.log('没有找到合适的匹配，使用第一个结果:', result.list[0].vod_name);
      return result.list[0];
    } else {
      console.log('爱坤API未返回有效搜索结果');
      return null;
    }
  } catch (error) {
    console.error('搜索爱坤影片失败:', error);
    return null;
  }
}

// 获取爱坤播放源数据
const fetchIkunSource = async () => {
  if (ikunLoaded.value || !videoInfo.value || ikunLoading.value) return;
  
  ikunLoading.value = true;
  ikunPlayList.value = []; // 先清空播放列表，避免旧数据干扰
  
  try {
    console.log('开始获取爱坤源...');
    
    // 设置请求超时
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('爱坤源请求超时')), 10000)
    );
    
    // 使用Promise.race实现超时控制
    const matchedMovie = await Promise.race([
      getIkunMatchedMovie(),
      timeout
    ]);
    
    if (matchedMovie && matchedMovie.vod_play_url) {
      console.log('找到匹配的爱坤电影:', matchedMovie.vod_name);
      // 先获取完整的详情信息
      try {
        const detailTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('爱坤详情请求超时')), 10000)
        );
        
        const detailResponse = await Promise.race([
          axios.get(`/ikun/api.php/provide/vod/`, {
            params: {
              ac: 'detail',
              ids: matchedMovie.vod_id
            }
          }),
          detailTimeout
        ]);
        
        if (detailResponse.data && detailResponse.data.code === 1 && 
            detailResponse.data.list && detailResponse.data.list.length > 0) {
          ikunDetailInfo.value = detailResponse.data.list[0];
          console.log('获取到爱坤详情信息:', ikunDetailInfo.value.vod_name);
          
          // 找到ikm3u8播放源（爱坤默认播放源）
          const playSource = ikunDetailInfo.value.vod_play_from.split(',')
            .findIndex(source => source.trim() === 'ikm3u8');
          
          if (playSource !== -1) {
            const playUrls = ikunDetailInfo.value.vod_play_url.split(',')[playSource];
            if (playUrls) {
              const episodes = playUrls.split('#');
              ikunPlayList.value = episodes.map((item, index) => {
                const [name, url] = item.split('$');
                return {
                  name: name?.trim() || `第${index + 1}集`,
                  url: url?.trim() || '',
                  id: matchedMovie.vod_id,
                  index
                };
              }).filter(episode => episode.url);
              
              console.log(`爱坤播放列表加载完成，共 ${ikunPlayList.value.length} 集`);
            }
          }
        }
      } catch (detailError) {
        console.error('获取爱坤详情失败，使用搜索结果:', detailError);
        // 如果获取详情失败，降级使用搜索结果的播放地址
        const playUrls = matchedMovie.vod_play_url.split('#');
        ikunPlayList.value = playUrls.map((item, index) => {
          const [name, url] = item.split('$');
          return {
            name: name?.trim() || `第${index + 1}集`,
            url: url?.trim() || '',
            id: matchedMovie.vod_id,
            index
          };
        }).filter(episode => episode.url);
        
        console.log(`从搜索结果加载爱坤播放列表，共 ${ikunPlayList.value.length} 集`);
      }
    } else {
      console.log('未找到匹配的爱坤电影');
    }
    
    ikunLoaded.value = true;
  } catch (error) {
    console.error('获取爱坤播放源失败:', error);
  } finally {
    ikunLoading.value = false;
  }
};

// 封装一个通用的带超时的异步请求函数
const requestWithTimeout = async (requestPromise, timeoutMs = 10000, errorMessage = '请求超时') => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  
  return Promise.race([requestPromise, timeout]);
};

// 封装一个带重试功能的请求函数
const requestWithRetry = async (requestFn, maxRetries = 2, timeoutMs = 10000, errorMessage = '请求超时') => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 如果不是第一次尝试，添加延迟，避免频繁请求
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        console.log(`第${attempt}次重试请求...`);
      }
      
      return await requestWithTimeout(requestFn(), timeoutMs, errorMessage);
    } catch (error) {
      console.error(`请求失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`, error);
      lastError = error;
    }
  }
  
  throw lastError;
};

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
      // type: getVideoType(),
      type: videoInfo.value.type_name,
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
    });
    const result = response.data;
    
    if (result && result.code === 1 && result.list && result.list.length > 0) {
      videoInfo.value = result.list[0];
      originalVideoInfo.value = { ...result.list[0] }; // 保存原始数据
      
      // 获取到视频信息后添加到历史记录
      addToHistory();
      
      // 从URL获取播放源参数
      const sourceFromUrl = route.query.source;
      console.log('URL指定的播放源:', sourceFromUrl);
      
      // 优先加载默认源和URL指定的源，其他源懒加载
      if (sourceFromUrl) {
        // 根据URL中的source参数优先加载指定源
        switch(sourceFromUrl) {
          case 'ikun':
            await fetchIkunSource();
            break;
          case 'subo':
            await fetchSuboSource();
            break;
          case 'huawei':
            await fetchHuaweiSource();
            break;
          case 'jisu':
            await fetchJisuSource();
            break;
          case '360':
            await fetch360Source();
            break;
          case 'wolong':
            await fetchWolongSource();
            break;
          default:
            // 不需要优先加载其他源
            break;
        }
      }
      
      // 等待DOM更新
      await nextTick();
      
      // 自动选择播放源
      if (playLists.value.length > 0) {
        console.log('可用播放源数量:', playLists.value.length);
        
        // 如果URL中有指定播放源，优先使用URL中的播放源
        if (sourceFromUrl) {
          const sourceMap = {
            'api': '黑木耳',
            'ikun': '爱坤',
            'wolong': '卧龙',
            '360': '360',
            'huawei': '华为',
            'jisu': '急速',
            'subo': '速播'
          };
          
          const sourceName = sourceMap[sourceFromUrl];
          console.log('查找播放源:', sourceName);
          
          // 查找匹配的播放源
          const sourceFromUrlExists = playLists.value.find(source => {
            console.log('检查播放源:', source.source, source.sourceKey);
            return (
              source.source === sourceName || 
              source.sourceKey === sourceFromUrl ||
              (sourceFromUrl === 'huawei' && source.source === '华为')
            );
          });
          
          if (sourceFromUrlExists) {
            console.log('找到匹配的播放源:', sourceFromUrlExists);
            activePlaySource.value = sourceFromUrlExists.source;
          } else {
            console.log('未找到指定的播放源，使用默认播放源');
            // 如果指定的播放源不存在，使用默认逻辑
            const heimuerSource = playLists.value.find(source => 
              source.source === '黑木耳' || source.sourceKey === 'heimuer' || source.sourceKey === 'ikm3u8'
            );
            
            if (heimuerSource) {
              activePlaySource.value = heimuerSource.source;
            } else {
              activePlaySource.value = playLists.value[0].source;
            }
          }
        } else {
          // 如果URL中没有指定播放源，使用默认逻辑
          const heimuerSource = playLists.value.find(source => 
            source.source === '黑木耳' || source.sourceKey === 'heimuer' || source.sourceKey === 'ikm3u8'
          );
          
          if (heimuerSource) {
            activePlaySource.value = heimuerSource.source;
          } else {
            activePlaySource.value = playLists.value[0].source;
          }
        }
        
        // 强制更新一下DOM
        await nextTick();
        
        // 当前选中的播放源
        const currentSource = playLists.value.find(s => s.source === activePlaySource.value);
        if (currentSource && currentSource.episodes && currentSource.episodes.length > 0) {
          activeEpisode.value = currentSource.episodes[0].url;
        }
      }
      
      // 在页面显示后，开始在后台加载其他播放源数据
      setTimeout(() => {
        loadOtherSourcesInBackground(sourceFromUrl);
      }, 1000);
    } else {
      error.value = '未找到影片信息';
    }
  } catch (err) {
    console.error('加载视频详情失败:', err);
    error.value = err.message || '加载失败';
  } finally {
    loading.value = false;
  }
}

// 在后台加载其他播放源数据，不阻塞页面渲染
async function loadOtherSourcesInBackground(prioritySource) {
  console.log('后台加载其他播放源数据...');
  
  // 创建一个加载队列，按优先级排序
  const loadQueue = [];
  
  // 根据当前已加载的源情况，决定要加载哪些源
  if (!ikunLoaded.value && prioritySource !== 'ikun') {
    loadQueue.push(() => fetchIkunSource());
  }
  
  if (!suboLoaded.value && prioritySource !== 'subo') {
    loadQueue.push(() => fetchSuboSource());
  }
  
  if (!huaweiLoaded.value && prioritySource !== 'huawei') {
    loadQueue.push(() => fetchHuaweiSource());
  }
  
  if (!jisuLoaded.value && prioritySource !== 'jisu') {
    loadQueue.push(() => fetchJisuSource());
  }
  
  if (!videozy360Loaded.value && prioritySource !== '360') {
    loadQueue.push(() => fetch360Source());
  }
  
  if (!wolongLoaded.value && prioritySource !== 'wolong') {
    loadQueue.push(() => fetchWolongSource());
  }
  
  // 使用Promise.all并行加载，但限制最大并行数为2，避免过多请求
  const batchSize = 2;
  for (let i = 0; i < loadQueue.length; i += batchSize) {
    const batch = loadQueue.slice(i, i + batchSize);
    try {
      await Promise.all(batch.map(loader => loader()));
    } catch (error) {
      console.error('后台加载源数据出错:', error);
      // 继续加载其他源，不中断
    }
  }
  
  console.log('所有播放源数据加载完成');
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

// 返回上一页
const goBack = () => {
  router.back();
};

// 添加选项卡点击事件处理
function onTabClick(tab) {
  console.log('手动点击了播放源:', tab.props.name);
  // 这里的额外处理可以确保激活状态正确
  activePlaySource.value = tab.props.name;
}

// 获取播放源图标
const getSourceIcon = (sourceKey) => {
  // 黑木耳源使用Film图标
  if (sourceKey === 'heimuer' || sourceKey === 'ikm3u8' || sourceKey === '黑木耳') {
    return 'Film';
  } 
  // 爱坤源使用VideoCamera图标
  else if (sourceKey === 'ikun' || sourceKey === '爱坤') {
    return 'VideoCamera';
  }
  // 速播源使用Download图标 
  else if (sourceKey === 'subo' || sourceKey === '速播' || 
          sourceKey.includes('subyun') || sourceKey.includes('subm3u8') || 
          sourceKey === 'sub') {
    return 'Download';
  }
  // 华为源使用Cellphone图标
  else if (sourceKey === 'huawei' || sourceKey === '华为') {
    return 'Cellphone';
  }
  // 急速源使用Monitor图标
  else if (sourceKey === 'jisu' || sourceKey === '急速' || 
          sourceKey.includes('jisuyun') || sourceKey.includes('jism3u8')) {
    return 'Monitor';
  }
  // 360源使用Picture图标
  else if (sourceKey === '360' || sourceKey.includes('360') ||
          sourceKey.includes('360yun') || sourceKey.includes('360m3u8')) {
    return 'Picture';
  }
  // 卧龙源使用VideoCamera图标
  else if (sourceKey === 'wolong' || sourceKey === '卧龙' ||
          sourceKey.includes('wolongyun') || sourceKey.includes('wolongm3u8')) {
    return 'VideoCameraFilled';
  }
  // 默认图标
  return 'VideoPlay';
}

// 获取匹配的急速影片
const getJisuMatchedMovie = async () => {
  try {
    const response = await axios.get(`/jisu/api.php/provide/vod/`, {
      params: {
        ac: 'videolist',
        wd: videoInfo.value.vod_name
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      // 找到最匹配的影片
      return response.data.list.find(item => 
        item.vod_name === videoInfo.value.vod_name || 
        (item.vod_sub && item.vod_sub.includes(videoInfo.value.vod_name))
      ) || response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取急速影片失败:', error);
    return null;
  }
};

// 获取急速影片详情
const getJisuMovieDetail = async (movieId) => {
  try {
    const response = await axios.get(`/jisu/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: movieId
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      return response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取急速影片详情失败:', error);
    return null;
  }
};

// 解析急速播放列表
const parseJisuPlayList = (detail) => {
  if (!detail || !detail.vod_play_from || !detail.vod_play_url) {
    console.warn('急速源：播放数据不完整');
    return [];
  }
  
  const playFrom = detail.vod_play_from.split(',');
  const playUrl = detail.vod_play_url.split(',');
  
  // 默认使用第一个播放源
  if (playFrom.length > 0 && playUrl.length > 0) {
    const videoUrls = playUrl[0].split('#');
    
    return videoUrls.map((item, index) => {
      const [name, url] = item.split('$');
      return {
        name: name?.trim() || `第${index + 1}集`,
        url: url?.trim() || '',
        index
      };
    }).filter(item => item.url);
  }
  
  return [];
};

// 获取急速源数据
const fetchJisuSource = async () => {
  if (jisuLoaded.value || jisuLoading.value) return;
  
  jisuLoading.value = true;
  jisuPlayList.value = [];
  
  try {
    // 保存原始影片信息，以便在切换回来时恢复
    if (!originalVideoInfo.value) {
      originalVideoInfo.value = { ...videoInfo.value };
    }
    
    // 1. 先通过影片名称搜索匹配的影片
    const matchedMovie = await getJisuMatchedMovie();
    if (!matchedMovie) {
      console.warn('急速源：未找到匹配的影片');
      return;
    }
    
    console.log('急速源：找到匹配影片', matchedMovie);
    
    // 2. 获取匹配影片的详情
    const detailInfo = await getJisuMovieDetail(matchedMovie.vod_id);
    if (!detailInfo) {
      console.warn('急速源：获取影片详情失败');
      return;
    }
    
    console.log('急速源：获取到详细信息', detailInfo);
    
    // 3. 保存详情信息，用于展示
    jisuDetailInfo.value = detailInfo;
    
    // 4. 解析播放列表
    const episodes = parseJisuPlayList(detailInfo);
    console.log('急速源：解析播放列表', episodes);
    
    if (episodes.length > 0) {
      // 为每个剧集添加急速源的影片ID
      jisuPlayList.value = episodes.map(episode => ({
        ...episode,
        id: detailInfo.vod_id // 添加急速源的影片ID
      }));
      console.log('急速源：完整播放列表', jisuPlayList.value);
    } else {
      console.warn('急速源：没有可用播放列表');
    }
  } catch (error) {
    console.error('获取急速源数据失败:', error);
  } finally {
    jisuLoading.value = false;
    jisuLoaded.value = true;
  }
};

// 更新急速详情信息到UI
const updateJisuDetailDisplay = () => {
  if (!jisuDetailInfo.value || !originalVideoInfo.value) return;
  
  // 更新展示的影片信息，但保留原始ID等关键信息
  const originalId = originalVideoInfo.value.vod_id;
  const originalType = originalVideoInfo.value.type_id;
  
  // 保留原始的播放源信息
  const originalPlayFrom = originalVideoInfo.value.vod_play_from;
  const originalPlayUrl = originalVideoInfo.value.vod_play_url;
  
  // 临时存储详细信息，与原始信息合并
  const detailInfo = {
    ...jisuDetailInfo.value,
    vod_id: originalId, // 保留原始ID
    type_id: originalType, // 保留原始类型
    _source: '急速', // 标记来源
    vod_play_from: originalPlayFrom, // 保留原始播放源信息
    vod_play_url: originalPlayUrl, // 保留原始播放URL信息
  };
  
  // 更新视图上的信息
  videoInfo.value = detailInfo;
};

// 获取匹配的华为影片
const getHuaweiMatchedMovie = async () => {
  try {
    const response = await axios.get(`/huawei/api.php/provide/vod/`, {
      params: {
        ac: 'videolist',
        wd: videoInfo.value.vod_name
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      // 找到最匹配的影片
      return response.data.list.find(item => 
        item.vod_name === videoInfo.value.vod_name || 
        (item.vod_sub && item.vod_sub.includes(videoInfo.value.vod_name))
      ) || response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取华为影片失败:', error);
    return null;
  }
};

// 获取华为影片详情
const getHuaweiMovieDetail = async (movieId) => {
  try {
    const response = await axios.get(`/huawei/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: movieId
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      return response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取华为影片详情失败:', error);
    return null;
  }
};

// 解析华为播放列表
const parseHuaweiPlayList = (detail) => {
  if (!detail || !detail.vod_play_from || !detail.vod_play_url) {
    console.warn('华为源：播放数据不完整');
    return [];
  }
  
  const playFrom = detail.vod_play_from.split(',');
  const playUrl = detail.vod_play_url.split(',');
  
  // 默认使用第一个播放源
  if (playFrom.length > 0 && playUrl.length > 0) {
    const videoUrls = playUrl[0].split('#');
    
    return videoUrls.map((item, index) => {
      const [name, url] = item.split('$');
      return {
        name: name?.trim() || `第${index + 1}集`,
        url: url?.trim() || '',
        index
      };
    }).filter(item => item.url);
  }
  
  return [];
};

// 获取华为源数据
const fetchHuaweiSource = async () => {
  if (huaweiLoaded.value || huaweiLoading.value) return;
  
  huaweiLoading.value = true;
  huaweiPlayList.value = [];
  
  try {
    // 保存原始影片信息，以便在切换回来时恢复
    if (!originalVideoInfo.value) {
      originalVideoInfo.value = { ...videoInfo.value };
    }
    
    // 1. 先通过影片名称搜索匹配的影片
    const matchedMovie = await getHuaweiMatchedMovie();
    if (!matchedMovie) {
      console.warn('华为源：未找到匹配的影片');
      return;
    }
    
    console.log('华为源：找到匹配影片', matchedMovie);
    
    // 2. 获取匹配影片的详情
    const detailInfo = await getHuaweiMovieDetail(matchedMovie.vod_id);
    if (!detailInfo) {
      console.warn('华为源：获取影片详情失败');
      return;
    }
    
    console.log('华为源：获取到详细信息', detailInfo);
    
    // 3. 保存详情信息，用于展示
    huaweiDetailInfo.value = detailInfo;
    
    // 4. 解析播放列表
    const episodes = parseHuaweiPlayList(detailInfo);
    console.log('华为源：解析播放列表', episodes);
    
    if (episodes.length > 0) {
      // 为每个剧集添加华为源的影片ID
      huaweiPlayList.value = episodes.map(episode => ({
        ...episode,
        id: detailInfo.vod_id // 添加华为源的影片ID
      }));
      console.log('华为源：完整播放列表', huaweiPlayList.value);
    } else {
      console.warn('华为源：没有可用播放列表');
    }
  } catch (error) {
    console.error('获取华为源数据失败:', error);
  } finally {
    huaweiLoading.value = false;
    huaweiLoaded.value = true;
  }
};

// 更新华为详情信息到UI
const updateHuaweiDetailDisplay = () => {
  if (!huaweiDetailInfo.value || !originalVideoInfo.value) return;
  
  // 更新展示的影片信息，但保留原始ID等关键信息
  const originalId = originalVideoInfo.value.vod_id;
  const originalType = originalVideoInfo.value.type_id;
  
  // 保留原始的播放源信息
  const originalPlayFrom = originalVideoInfo.value.vod_play_from;
  const originalPlayUrl = originalVideoInfo.value.vod_play_url;
  
  // 临时存储详细信息，与原始信息合并
  const detailInfo = {
    ...huaweiDetailInfo.value,
    vod_id: originalId, // 保留原始ID
    type_id: originalType, // 保留原始类型
    _source: '华为', // 标记来源
    vod_play_from: originalPlayFrom, // 保留原始播放源信息
    vod_play_url: originalPlayUrl, // 保留原始播放URL信息
  };
  
  // 更新视图上的信息
  videoInfo.value = detailInfo;
};

// 获取匹配的360影片
const get360MatchedMovie = async () => {
  try {
    const response = await axios.get(`/360/api.php/provide/vod/`, {
      params: {
        ac: 'videolist',
        wd: videoInfo.value.vod_name
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      // 找到最匹配的影片
      return response.data.list.find(item => 
        item.vod_name === videoInfo.value.vod_name || 
        (item.vod_sub && item.vod_sub.includes(videoInfo.value.vod_name))
      ) || response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取360影片失败:', error);
    return null;
  }
};

// 获取360影片详情
const get360MovieDetail = async (movieId) => {
  try {
    const response = await axios.get(`/360/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: movieId
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      return response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取360影片详情失败:', error);
    return null;
  }
};

// 解析360播放列表
const parse360PlayList = (detail) => {
  if (!detail || !detail.vod_play_from || !detail.vod_play_url) {
    console.warn('360源：播放数据不完整');
    return [];
  }
  
  const playFrom = detail.vod_play_from.split(',');
  const playUrl = detail.vod_play_url.split(',');
  
  // 默认使用第一个播放源
  if (playFrom.length > 0 && playUrl.length > 0) {
    const videoUrls = playUrl[0].split('#');
    
    return videoUrls.map((item, index) => {
      const [name, url] = item.split('$');
      return {
        name: name?.trim() || `第${index + 1}集`,
        url: url?.trim() || '',
        index
      };
    }).filter(item => item.url);
  }
  
  return [];
};

// 获取360源数据
const fetch360Source = async () => {
  if (videozy360Loaded.value || videozy360Loading.value) return;
  
  videozy360Loading.value = true;
  videozy360PlayList.value = [];
  
  try {
    // 保存原始影片信息，以便在切换回来时恢复
    if (!originalVideoInfo.value) {
      originalVideoInfo.value = { ...videoInfo.value };
    }
    
    // 1. 先通过影片名称搜索匹配的影片
    const matchedMovie = await get360MatchedMovie();
    if (!matchedMovie) {
      console.warn('360源：未找到匹配的影片');
      return;
    }
    
    console.log('360源：找到匹配影片', matchedMovie);
    
    // 2. 获取匹配影片的详情
    const detailInfo = await get360MovieDetail(matchedMovie.vod_id);
    if (!detailInfo) {
      console.warn('360源：获取影片详情失败');
      return;
    }
    
    console.log('360源：获取到详细信息', detailInfo);
    
    // 3. 保存详情信息，用于展示
    videozy360DetailInfo.value = detailInfo;
    
    // 4. 解析播放列表
    const episodes = parse360PlayList(detailInfo);
    console.log('360源：解析播放列表', episodes);
    
    if (episodes.length > 0) {
      // 为每个剧集添加360源的影片ID
      videozy360PlayList.value = episodes.map(episode => ({
        ...episode,
        id: detailInfo.vod_id // 添加360源的影片ID
      }));
      console.log('360源：完整播放列表', videozy360PlayList.value);
    } else {
      console.warn('360源：没有可用播放列表');
    }
  } catch (error) {
    console.error('获取360源数据失败:', error);
  } finally {
    videozy360Loading.value = false;
    videozy360Loaded.value = true;
  }
};

// 更新360详情信息到UI
const update360DetailDisplay = () => {
  if (!videozy360DetailInfo.value || !originalVideoInfo.value) return;
  
  // 更新展示的影片信息，但保留原始ID等关键信息
  const originalId = originalVideoInfo.value.vod_id;
  const originalType = originalVideoInfo.value.type_id;
  
  // 保留原始的播放源信息
  const originalPlayFrom = originalVideoInfo.value.vod_play_from;
  const originalPlayUrl = originalVideoInfo.value.vod_play_url;
  
  // 临时存储详细信息，与原始信息合并
  const detailInfo = {
    ...videozy360DetailInfo.value,
    vod_id: originalId, // 保留原始ID
    type_id: originalType, // 保留原始类型
    _source: '360', // 标记来源
    vod_play_from: originalPlayFrom, // 保留原始播放源信息
    vod_play_url: originalPlayUrl, // 保留原始播放URL信息
  };
  
  // 更新视图上的信息
  videoInfo.value = detailInfo;
};

// 获取匹配的速播影片
const getSuboMatchedMovie = async () => {
  try {
    const response = await axios.get(`/subo/api.php/provide/vod/`, {
      params: {
        ac: 'videolist',
        wd: videoInfo.value.vod_name
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      // 找到最匹配的影片
      return response.data.list.find(item => 
        item.vod_name === videoInfo.value.vod_name || 
        (item.vod_sub && item.vod_sub.includes(videoInfo.value.vod_name))
      ) || response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取速播影片失败:', error);
    return null;
  }
};

// 获取速播影片详情
const getSuboMovieDetail = async (movieId) => {
  try {
    const response = await axios.get(`/subo/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: movieId
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      return response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取速播影片详情失败:', error);
    return null;
  }
};

// 解析速播播放列表
const parseSuboPlayList = (detail) => {
  if (!detail || !detail.vod_play_from || !detail.vod_play_url) {
    console.warn('速播源：播放数据不完整');
    return [];
  }
  
  const playFrom = detail.vod_play_from.split(',');
  const playUrl = detail.vod_play_url.split(',');
  
  // 默认使用第一个播放源
  if (playFrom.length > 0 && playUrl.length > 0) {
    const videoUrls = playUrl[0].split('#');
    
    return videoUrls.map((item, index) => {
      const [name, url] = item.split('$');
      return {
        name: name?.trim() || `第${index + 1}集`,
        url: url?.trim() || '',
        index
      };
    }).filter(item => item.url);
  }
  
  return [];
};

// 获取速播源数据
const fetchSuboSource = async () => {
  if (suboLoaded.value || suboLoading.value) return;
  
  suboLoading.value = true;
  suboPlayList.value = [];
  
  try {
    // 保存原始影片信息，以便在切换回来时恢复
    if (!originalVideoInfo.value) {
      originalVideoInfo.value = { ...videoInfo.value };
    }
    
    // 1. 先通过影片名称搜索匹配的影片
    const matchedMovie = await getSuboMatchedMovie();
    if (!matchedMovie) {
      console.warn('速播源：未找到匹配的影片');
      return;
    }
    
    console.log('速播源：找到匹配影片', matchedMovie);
    
    // 2. 获取匹配影片的详情
    const detailInfo = await getSuboMovieDetail(matchedMovie.vod_id);
    if (!detailInfo) {
      console.warn('速播源：获取影片详情失败');
      return;
    }
    
    console.log('速播源：获取到详细信息', detailInfo);
    
    // 3. 保存详情信息，用于展示
    suboDetailInfo.value = detailInfo;
    
    // 4. 解析播放列表
    const episodes = parseSuboPlayList(detailInfo);
    console.log('速播源：解析播放列表', episodes);
    
    if (episodes.length > 0) {
      // 为每个剧集添加速播源的影片ID
      suboPlayList.value = episodes.map(episode => ({
        ...episode,
        id: detailInfo.vod_id // 添加速播源的影片ID
      }));
      console.log('速播源：完整播放列表', suboPlayList.value);
    } else {
      console.warn('速播源：没有可用播放列表');
    }
  } catch (error) {
    console.error('获取速播源数据失败:', error);
  } finally {
    suboLoading.value = false;
    suboLoaded.value = true;
  }
};

// 更新速播详情信息到UI
const updateSuboDetailDisplay = () => {
  if (!suboDetailInfo.value || !originalVideoInfo.value) return;
  
  // 更新展示的影片信息，但保留原始ID等关键信息
  const originalId = originalVideoInfo.value.vod_id;
  const originalType = originalVideoInfo.value.type_id;
  
  // 保留原始的播放源信息
  const originalPlayFrom = originalVideoInfo.value.vod_play_from;
  const originalPlayUrl = originalVideoInfo.value.vod_play_url;
  
  // 临时存储详细信息，与原始信息合并
  const detailInfo = {
    ...suboDetailInfo.value,
    vod_id: originalId, // 保留原始ID
    type_id: originalType, // 保留原始类型
    _source: '速播', // 标记来源
    vod_play_from: originalPlayFrom, // 保留原始播放源信息
    vod_play_url: originalPlayUrl, // 保留原始播放URL信息
  };
  
  // 更新视图上的信息
  videoInfo.value = detailInfo;
};

// 在加载视频详情后也加载各个资源
watch(() => videoInfo.value, (newVal) => {
  if (newVal) {
    fetchIkunSource();
    fetchSuboSource();
    fetchHuaweiSource();
    fetchJisuSource();
    fetch360Source();
    fetchWolongSource();
  }
});

// 获取匹配的卧龙影片
const getWolongMatchedMovie = async () => {
  try {
    const response = await axios.get(`/wolong/api.php/provide/vod/`, {
      params: {
        ac: 'videolist',
        wd: videoInfo.value.vod_name
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      // 找到最匹配的影片
      return response.data.list.find(item => 
        item.vod_name === videoInfo.value.vod_name || 
        (item.vod_sub && item.vod_sub.includes(videoInfo.value.vod_name))
      ) || response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取卧龙影片失败:', error);
    return null;
  }
};

// 获取卧龙影片详情
const getWolongMovieDetail = async (movieId) => {
  try {
    const response = await axios.get(`/wolong/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: movieId
      }
    });
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      return response.data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('获取卧龙影片详情失败:', error);
    return null;
  }
};

// 解析卧龙播放列表
const parseWolongPlayList = (detail) => {
  if (!detail || !detail.vod_play_from || !detail.vod_play_url) {
    console.warn('卧龙源：播放数据不完整');
    return [];
  }
  
  const playFrom = detail.vod_play_from.split(',');
  const playUrl = detail.vod_play_url.split(',');
  
  // 默认使用第一个播放源
  if (playFrom.length > 0 && playUrl.length > 0) {
    const videoUrls = playUrl[0].split('#');
    
    return videoUrls.map((item, index) => {
      const [name, url] = item.split('$');
      return {
        name: name?.trim() || `第${index + 1}集`,
        url: url?.trim() || '',
        index
      };
    }).filter(item => item.url);
  }
  
  return [];
};

// 获取卧龙源数据
const fetchWolongSource = async () => {
  if (wolongLoaded.value || wolongLoading.value) return;
  
  wolongLoading.value = true;
  wolongPlayList.value = [];
  
  try {
    // 保存原始影片信息，以便在切换回来时恢复
    if (!originalVideoInfo.value) {
      originalVideoInfo.value = { ...videoInfo.value };
    }
    
    // 1. 先通过影片名称搜索匹配的影片
    const matchedMovie = await getWolongMatchedMovie();
    if (!matchedMovie) {
      console.warn('卧龙源：未找到匹配的影片');
      return;
    }
    
    console.log('卧龙源：找到匹配影片', matchedMovie);
    
    // 2. 获取匹配影片的详情
    const detailInfo = await getWolongMovieDetail(matchedMovie.vod_id);
    if (!detailInfo) {
      console.warn('卧龙源：获取影片详情失败');
      return;
    }
    
    console.log('卧龙源：获取到详细信息', detailInfo);
    
    // 3. 保存详情信息，用于展示
    wolongDetailInfo.value = detailInfo;
    
    // 4. 解析播放列表
    const episodes = parseWolongPlayList(detailInfo);
    console.log('卧龙源：解析播放列表', episodes);
    
    if (episodes.length > 0) {
      // 为每个剧集添加卧龙源的影片ID
      wolongPlayList.value = episodes.map(episode => ({
        ...episode,
        id: detailInfo.vod_id // 添加卧龙源的影片ID
      }));
      console.log('卧龙源：完整播放列表', wolongPlayList.value);
    } else {
      console.warn('卧龙源：没有可用播放列表');
    }
  } catch (error) {
    console.error('获取卧龙源数据失败:', error);
  } finally {
    wolongLoading.value = false;
    wolongLoaded.value = true;
  }
};

// 更新卧龙详情信息到UI
const updateWolongDetailDisplay = () => {
  if (!wolongDetailInfo.value || !originalVideoInfo.value) return;
  
  // 更新展示的影片信息，但保留原始ID等关键信息
  const originalId = originalVideoInfo.value.vod_id;
  const originalType = originalVideoInfo.value.type_id;
  
  // 保留原始的播放源信息
  const originalPlayFrom = originalVideoInfo.value.vod_play_from;
  const originalPlayUrl = originalVideoInfo.value.vod_play_url;
  
  // 临时存储详细信息，与原始信息合并
  const detailInfo = {
    ...wolongDetailInfo.value,
    vod_id: originalId, // 保留原始ID
    type_id: originalType, // 保留原始类型
    _source: '卧龙', // 标记来源
    vod_play_from: originalPlayFrom, // 保留原始播放源信息
    vod_play_url: originalPlayUrl, // 保留原始播放URL信息
  };
  
  // 更新视图上的信息
  videoInfo.value = detailInfo;
};

const playVideo = (episode) => {
  if (!videoInfo.value) return
  
  // 获取当前剧集信息
  activeEpisode.value = episode.url
  currentPlayUrl.value = episode.url
  
  // 获取当前选中的播放源
  const currentSource = playLists.value.find(source => source.source === activePlaySource.value);
  if (!currentSource) return;
  
  // 特殊处理不同的播放源
  let sourceId = videoInfo.value?.vod_id || '';
  if (currentSource.sourceKey === 'subo' && suboDetailInfo.value) {
    sourceId = suboDetailInfo.value.vod_id;
  } else if (currentSource.sourceKey === 'huawei' && huaweiDetailInfo.value) {
    sourceId = huaweiDetailInfo.value.vod_id;
  } else if (currentSource.sourceKey === 'jisu' && jisuDetailInfo.value) {
    sourceId = jisuDetailInfo.value.vod_id;
  } else if (currentSource.sourceKey === '360' && videozy360DetailInfo.value) {
    sourceId = videozy360DetailInfo.value.vod_id;
  } else if (currentSource.sourceKey === 'wolong' && wolongDetailInfo.value) {
    sourceId = wolongDetailInfo.value.vod_id;
  }
  
  router.push(`/play/${sourceId}/${episode.index + 1}/${currentSource.sourceKey}`);
}

// 分享功能
const shareToWeChat = () => {
  // 更新当前页面URL（以防页面有变化）
  currentPageUrl.value = window.location.href;
  // 显示微信分享弹窗
  qrCodeDialogVisible.value = true;
};

const shareToWeibo = () => {
  const shareUrl = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(videoInfo.value?.vod_name || '');
  const imageUrl = encodeURIComponent(videoInfo.value?.vod_pic || '');
  
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${shareUrl}&title=${title}&pic=${imageUrl}`;
  window.open(weiboUrl, '_blank');
};

const shareToQQ = () => {
  const shareUrl = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(videoInfo.value?.vod_name || '');
  const summary = encodeURIComponent(videoInfo.value?.vod_content?.substring(0, 50) || '');
  const imageUrl = encodeURIComponent(videoInfo.value?.vod_pic || '');
  
  const qqUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${shareUrl}&title=${title}&pics=${imageUrl}&summary=${summary}`;
  window.open(qqUrl, '_blank');
};

const copyShareLink = () => {
  const input = document.createElement('input');
  input.value = window.location.href;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  
  ElMessage({
    message: '分享链接已复制到剪贴板',
    type: 'success'
  });
};

// 海报分享
const posterDialogVisible = ref(false);
const posterContainer = ref(null);

const generatePosterShare = () => {
  currentPageUrl.value = window.location.href;
  posterDialogVisible.value = true;
};

const downloadPoster = async () => {
  if (!posterContainer.value) return;
  
  try {
    // 等待一下确保内容渲染完成
    await nextTick();
    
    // 找到海报元素
    const poster = posterContainer.value.querySelector('.share-poster');
    if (!poster) {
      ElMessage.error('无法获取海报内容');
      return;
    }
    
    // 使用html2canvas将DOM元素转换为canvas
    const canvas = await html2canvas(poster, {
      useCORS: true, // 允许跨域图片
      scale: 2, // 提高清晰度
      backgroundColor: null,
      logging: false
    });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    const fileName = `${videoInfo.value?.vod_name || '影视'}_海报分享.png`;
    link.download = fileName;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage({
      message: '海报已下载',
      type: 'success'
    });
  } catch (error) {
    console.error('下载海报失败:', error);
    ElMessage.error('下载海报失败');
  }
};

// 关闭二维码弹窗
const closeQrCodeDialog = () => {
  qrCodeDialogVisible.value = false;
};

const qrCodeDialogVisible = ref(false);

// 获取当前页面URL用于生成二维码
const currentPageUrl = ref(window.location.href);

// 下载二维码
const qrCodeContainer = ref(null);
const downloadQRCode = () => {
  if (!qrCodeContainer.value) return;
  
  try {
    // 获取二维码容器中的canvas元素
    const canvas = qrCodeContainer.value.querySelector('canvas');
    if (!canvas) {
      ElMessage.error('无法获取二维码图像');
      return;
    }
    
    // 创建一个临时的链接元素
    const link = document.createElement('a');
    
    // 将canvas转换为图片数据
    link.href = canvas.toDataURL('image/png');
    
    // 设置下载的文件名
    const fileName = `微信二维码_${videoInfo.value?.vod_name || '分享'}.png`;
    link.download = fileName;
    
    // 添加到文档中并触发点击
    document.body.appendChild(link);
    link.click();
    
    // 移除临时元素
    document.body.removeChild(link);
    
    ElMessage({
      message: '二维码已下载',
      type: 'success'
    });
  } catch (error) {
    console.error('下载二维码失败:', error);
    ElMessage.error('下载二维码失败');
  }
};
</script>

<style scoped>
.video-detail-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
}

/* 自定义加载动画 */
.custom-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader-wave {
  display: flex;
  align-items: flex-end;
  height: 50px;
  gap: 6px;
}

.wave-bar {
  width: 8px;
  background-color: var(--theme-color, #409EFF);
  border-radius: 4px;
  animation: wave 1s ease-in-out infinite;
}

.wave-bar:nth-child(2) {
  animation-delay: 0.1s;
}

.wave-bar:nth-child(3) {
  animation-delay: 0.2s;
}

.wave-bar:nth-child(4) {
  animation-delay: 0.3s;
}

.wave-bar:nth-child(5) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0% {
    height: 10px;
  }
  50% {
    height: 40px;
  }
  100% {
    height: 10px;
  }
}

.loader-text {
  margin-top: 16px;
  font-size: 16px;
  color: var(--text-color);
}

.back-button-container {
  /* padding: 16px; */
  padding-left: 0;
  margin-bottom: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.video-detail-content {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  position: relative;
}

.source {
  margin-bottom: 20px;
}

.source-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
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
  /* margin-bottom: 16px; */
  padding-bottom: 12px;
  /* border-bottom: 1px solid var(--border-color); */
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
  margin-top: 10px;
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

.source-loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 12px;
}

.source-loading-content {
  padding: 20px;
  background-color: var(--card-background);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: var(--card-shadow);
}

.source-loading-icon {
  font-size: 32px;
  color: var(--theme-color);
}

.source-tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.source-tab-label .el-icon {
  font-size: 16px;
}

:deep(.el-tabs__item) {
  display: inline-flex;
  align-items: center;
  padding: 0 20px;
  height: 40px;
  font-size: 14px;
  color: var(--text-color);
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

:deep(.el-tabs__item.is-active) {
  color: var(--theme-color);
  border-bottom-color: transparent;
}

:deep(.el-tabs__item:hover) {
  color: var(--theme-color);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}

@media (max-width: 768px) {
  :deep(.el-tabs__item) {
    padding: 0 12px;
    height: 36px;
    font-size: 13px;
  }
  
  .source-tab-label .el-icon {
    font-size: 14px;
  }
}

.source-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.source-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.source-select {
  width: 180px;
}

:deep(.el-select-dropdown__item) {
  padding: 0 15px;
}

:deep(.el-select-dropdown__item.selected) {
  color: var(--theme-color);
  font-weight: bold;
}

:deep(.el-input__wrapper) {
  padding: 0 12px;
  border-radius: 8px;
}

:deep(.el-select .el-input__inner) {
  height: 36px;
}

.source-option-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-option-label .el-icon {
  font-size: 16px;
  color: var(--theme-color);
}

.episode-container {
  margin-top: 15px;
}

@media (max-width: 768px) {
  .source-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .source-select {
    width: 100%;
  }
  
  .source-title {
    font-size: 16px;
    margin-bottom: 5px;
  }
  
  .episode-container {
    margin-top: 10px;
  }
  
  :deep(.el-select .el-input__inner) {
    font-size: 14px;
  }
  
  :deep(.el-select-dropdown__item) {
    height: 40px;
    line-height: 40px;
  }
  
  .title-with-rating {
    flex-wrap: wrap;
  }
  
  .poster-title {
    font-size: 16px;
  }
  
  .score-value {
    font-size: 20px;
  }
}

.share-dropdown {
  margin-left: 0;
}

.share-item {
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
  width: 100%;
}

.share-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-text {
  text-align: left;
  font-size: 14px;
}

/* Element Plus 样式覆盖 */
:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  line-height: 1.5;
  min-width: 140px;
}

:deep(.el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover) {
  background-color: var(--hover-background);
  color: var(--text-color);
}

.qrcode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.qrcode-tip {
  margin-top: 12px;
  color: var(--text-color-secondary);
  font-size: 14px;
}

/* 海报分享样式 */
.poster-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.share-poster {
  width: 300px;
  background-color: var(--card-background);
  /* border-radius: 12px; */
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 8px;
}

.poster-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.poster-image {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.poster-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title-with-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.poster-title {
  font-size: 18px;
  margin: 0;
  color: var(--text-color);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.poster-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
}

.poster-meta div {
  background-color: rgba(var(--theme-color-rgb), 0.1);
  color: var(--theme-color);
  padding: 2px 8px;
  border-radius: 4px;
}

.poster-score {
  display: flex;
  align-items: baseline;
  white-space: nowrap;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #ff9900;
}

.score-text {
  font-size: 14px;
  color: #ff9900;
  margin-left: 2px;
}

.poster-desc {
  font-size: 13px;
  color: var(--text-color-secondary);
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.poster-footer {
  padding-top: 15px;
  border-top: 1px dashed var(--border-color);
  display: flex;
  align-items: center;
  gap: 15px;
}

.poster-qr-tip {
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.5;
}

.poster-qr-tip div:last-child {
  font-weight: bold;
  color: var(--theme-color);
}
</style> 