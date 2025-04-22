import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHistoryStore } from '../stores/history'
import { ElMessage } from 'element-plus'

const route = useRoute()
const historyStore = useHistoryStore()
const videoInfo = ref(null)

// 在视频信息加载成功后添加到历史记录
const addToHistory = () => {
  if (videoInfo.value) {
    historyStore.addHistory({
      id: videoInfo.value.vod_id,
      title: videoInfo.value.vod_name,
      type: route.params.type,
      url: route.fullPath,
      poster: videoInfo.value.vod_pic
    })
    console.log('已添加到历史记录:', videoInfo.value.vod_name)
  }
}

// 获取视频信息
const fetchVideoInfo = async () => {
  try {
    const response = await axios.get(`/api/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: route.params.id
      }
    })
    
    if (response.data && response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      videoInfo.value = response.data.list[0]
      addToHistory() // 获取到视频信息后立即添加到历史记录
    }
  } catch (error) {
    console.error('获取视频信息失败:', error)
    ElMessage.error('获取视频信息失败')
  }
}

// 在 onMounted 中调用
onMounted(() => {
  fetchVideoInfo()
})

// 监听视频信息变化
watch(videoInfo, (newVal) => {
  if (newVal) {
    addToHistory()
  }
}) 