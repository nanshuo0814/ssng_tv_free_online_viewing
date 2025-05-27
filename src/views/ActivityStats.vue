<!-- 活动记录统计页面 -->
<template>
  <div class="activity-stats-page">
    
    <!-- 添加公告栏 -->
    <div class="notice-banner">
      <el-alert
        title="温馨提示"
        type="success"
        description="这里记录了您访问网站的时长统计、访问频率等数据。所有数据仅保存在您的本地浏览器中，保护您的隐私安全。"
        :closable="false"
        show-icon
      />
    </div>
    <!-- 总览数据卡片 -->
    <div class="overview-cards">
      <div class="stat-card">
        <div class="card-title">总访问时长</div>
        <div class="card-value">{{ formatDuration(activityStore.getTotalVisitTime) }}</div>
      </div>
      <div class="stat-card">
        <div class="card-title">访问次数</div>
        <div class="card-value">{{ activityStore.getVisitCount }} 次</div>
      </div>
      <div class="stat-card">
        <div class="card-title">最近访问</div>
        <div class="card-value">{{ formatLastVisit(activityStore.activityStats.lastVisit) }}</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 每日访问时长趋势 -->
      <div class="chart-wrapper">
        <h3>每日访问时长趋势</h3>
        <div class="chart" ref="dailyChart"></div>
      </div>

      <!-- 每周访问分布 -->
      <div class="chart-wrapper">
        <div class="chart-header">
          <h3>每周访问分布</h3>
        </div>
        <div class="chart" ref="weekdayChart"></div>
      </div>

      <!-- 时段访问热力图 -->
      <div class="chart-wrapper">
        <h3>时段访问分布</h3>
        <div class="chart" ref="timeSlotChart"></div>
      </div>

      <!-- 页面访问排行榜 -->
      <div class="chart-wrapper">
        <div class="chart-header">
          <div class="title-with-count">
            <h3>页面访问排行</h3>
            <el-tag size="small" type="info" round effect="plain" class="record-count">
              共 {{ activityStore.getPageVisits?.length || 0 }} 条记录
            </el-tag>
          </div>
        </div>
        <div class="page-visits-ranking">
          <el-empty v-if="!activityStore.getPageVisits?.length" description="暂无访问数据" />
          <el-scrollbar v-else max-height="300">
            <div class="ranking-list">
              <router-link
                v-for="(page, index) in activityStore.getPageVisits"
                :key="page.path"
                :to="page.path"
                class="ranking-item"
              >
                <div class="rank-badge" :class="getRankClass(index)">
                  <template v-if="index < 3">
                    <el-icon v-if="index === 0"><TrophyBase /></el-icon>
                    <el-icon v-else-if="index === 1"><Medal /></el-icon>
                    <el-icon v-else><StarFilled /></el-icon>
                  </template>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="page-info">
                  <div class="page-title">{{ getPageTitle(page) }}</div>
                  <div class="page-path">{{ page.path }}</div>
                </div>
                <div class="visit-count">{{ page.count }}次</div>
                <el-icon class="goto-icon"><ArrowRight /></el-icon>
              </router-link>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-button type="danger" @click="confirmClear">清除统计数据</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useActivityStore } from '../stores/activity'
import * as echarts from 'echarts'
import { ElMessageBox } from 'element-plus'
import { ArrowRight, TrophyBase, Medal, StarFilled } from '@element-plus/icons-vue'

const activityStore = useActivityStore()

// 图表引用
const dailyChart = ref(null)
const weekdayChart = ref(null)
const timeSlotChart = ref(null)

// 图表实例
let dailyChartInstance = null
let weekdayChartInstance = null
let timeSlotChartInstance = null

// 更新定时器
let updateTimer = null

// 星期数据
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 格式化持续时间
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

// 格式化最后访问时间
const formatLastVisit = (dateStr) => {
  if (!dateStr) return '暂无记录'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取页面标题
const getPageTitle = (page) => {
  if (!page) return '未知页面'
  return page.title || getDefaultTitle(page.path) || '未知页面'
}

// 根据路径获取默认标题
const getDefaultTitle = (path) => {
  const routeMap = {
    '/home': '首页',
    '/tv': '电视剧',
    '/movies': '电影',
    '/anime': '动漫',
    '/shorts': '短剧',
    '/variety': '综艺',
    '/external-video': '凌云影视',
    '/soupian': '搜片.com',
    '/favorites': '我的收藏',
    '/history': '历史记录',
    '/activity': '活动记录',
    '/message-board': '评论留言'
  }
  return routeMap[path]
}

// 获取排名样式类
const getRankClass = (index) => {
  const classes = ['rank-badge']
  if (index === 0) return [...classes, 'rank-first']
  if (index === 1) return [...classes, 'rank-second']
  if (index === 2) return [...classes, 'rank-third']
  return classes
}

// 在 mounted 和 resize 事件中重新初始化图表
const resizeCharts = () => {
  dailyChartInstance?.resize()
  weekdayChartInstance?.resize()
  timeSlotChartInstance?.resize()
}

// 初始化每日访问趋势图
const initDailyChart = () => {
  if (!dailyChart.value) return
  
  const dailyData = activityStore.getDailyVisitTime
  const dates = Object.keys(dailyData).sort()
  const values = dates.map(date => Math.floor(dailyData[date] / 60))
  
  dailyChartInstance = echarts.init(dailyChart.value)
  dailyChartInstance.setOption({
    grid: {
      top: '10%',
      left: '10%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `${params[0].name}<br/>访问时长: ${formatDuration(params[0].value * 60)}`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        formatter: (value) => value.slice(5), // 只显示月-日
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '访问时长(分钟)',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      }
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      },
      lineStyle: {
        width: 3
      },
      itemStyle: {
        borderWidth: 2
      }
    }]
  })
}

// 初始化每周访问分布图
const initWeekdayChart = () => {
  if (!weekdayChart.value) return
  
  const weekdayData = activityStore.getWeekdayStats
  const values = weekdays.map((day, index) => ({
    value: Math.floor((weekdayData[index] || 0) / 60),
    name: day
  }))

  // 自定义颜色
  const colors = [
    '#91cc75', // 周日 - 绿色
    '#5470c6', // 周一 - 蓝色
    '#fac858', // 周二 - 黄色
    '#ee6666', // 周三 - 红色
    '#73c0de', // 周四 - 浅蓝
    '#3ba272', // 周五 - 深绿
    '#fc8452'  // 周六 - 橙色
  ]
  
  weekdayChartInstance = echarts.init(weekdayChart.value)
  weekdayChartInstance.setOption({
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const percent = ((params.value / values.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
        return `${params.name}<br/>访问时长: ${formatDuration(params.value * 60)}<br/>占比: ${percent}%`
      }
    },
    legend: {
      orient: 'horizontal',
      top: 'bottom',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 15,
      textStyle: {
        fontSize: 12,
        color: 'var(--text-color)'
      }
    },
    series: [{
      name: '每周访问',
      type: 'pie',
      radius: ['35%', '60%'], // 稍微缩小饼图尺寸
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: 'var(--card-background)',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: (params) => {
          const percent = ((params.value / values.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
          return `${params.name}\n${percent}%`
        },
        fontSize: 12,
        color: 'var(--text-color)'
      },
      labelLine: {
        length: 15,
        length2: 10,
        smooth: true
      },
      emphasis: {
        label: {
          fontSize: 14,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      },
      data: values
    }]
  })
}

// 初始化时段访问分布图
const initTimeSlotChart = () => {
  if (!timeSlotChart.value) return
  
  const timeSlotData = activityStore.getTimeSlotStats
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const values = hours.map(hour => Math.floor((timeSlotData[hour] || 0) / 60))
  
  timeSlotChartInstance = echarts.init(timeSlotChart.value)
  timeSlotChartInstance.setOption({
    grid: {
      top: '10%',
      left: '10%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `${params[0].name}时<br/>访问时长: ${formatDuration(params[0].value * 60)}`
      }
    },
    xAxis: {
      type: 'category',
      data: hours.map(h => `${h}`)
    },
    yAxis: {
      type: 'value',
      name: '访问时长(分钟)',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      }
    },
    series: [{
      data: values,
      type: 'bar',
      itemStyle: {
        borderRadius: [4, 4, 0, 0]
      }
    }]
  })
}

// 确认清除数据
const confirmClear = () => {
  ElMessageBox.confirm(
    '确定要清除所有统计数据吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    activityStore.clearStats()
    // 重新初始化图表
    initDailyChart()
    initWeekdayChart()
    initTimeSlotChart()
  }).catch(() => {})
}

// 更新图表数据
const updateCharts = () => {
  initDailyChart()
  initWeekdayChart()
  initTimeSlotChart()
}

onMounted(() => {
  // 初始化图表
  updateCharts()
  
  // 设置定时更新
  updateTimer = setInterval(() => {
    activityStore.updateVisitTime()
    updateCharts()
  }, 60000)
  
  // 监听窗口大小变化和侧边栏状态变化
  window.addEventListener('resize', resizeCharts)
  
  // 使用 ResizeObserver 监听容器大小变化
  const observer = new ResizeObserver(() => {
    resizeCharts()
  })
  
  // 监听每个图表容器的大小变化
  if (dailyChart.value) observer.observe(dailyChart.value)
  if (weekdayChart.value) observer.observe(weekdayChart.value)
  if (timeSlotChart.value) observer.observe(timeSlotChart.value)
})

onBeforeUnmount(() => {
  // 清理定时器
  if (updateTimer) {
    clearInterval(updateTimer)
  }
  
  // 移除事件监听
  window.removeEventListener('resize', resizeCharts)
  
  // 销毁图表实例
  dailyChartInstance?.dispose()
  weekdayChartInstance?.dispose()
  timeSlotChartInstance?.dispose()
})
</script>

<style scoped>
.activity-stats-page {
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
}

.notice-banner {
  margin-bottom: 24px;
}

.notice-banner :deep(.el-alert) {
  border-radius: 8px;
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
}

.notice-banner :deep(.el-alert__title) {
  font-size: 16px;
  font-weight: 600;
}

.notice-banner :deep(.el-alert__description) {
  font-size: 14px;
  margin: 8px 0;
  color: var(--text-color);
}

.page-title {
  margin-bottom: 14px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--card-shadow);
}

.card-title {
  font-size: 16px;
  color: var(--text-color-light);
  margin-bottom: 10px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(calc(33.33% - 32px), 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.chart-wrapper {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 20px 0 20px 0;
  box-shadow: var(--card-shadow);
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.chart-wrapper h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.chart {
  height: 300px;
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.page-visits-ranking {
  height: 300px;
}

.ranking-list {
  padding: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s;
  text-decoration: none;
  color: var(--text-color);
  cursor: pointer;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-item:hover {
  background-color: var(--hover-background);
  
  .rank-badge {
    transform: scale(1.1);
  }
  
  .goto-icon {
    opacity: 1;
    transform: translateX(0);
  }
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
  background-color: var(--text-color-light);
  color: var(--card-background);
  transition: all 0.3s ease;
}

.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.rank-first :deep(.el-icon) {
  font-size: 18px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #a9a9a9);
  color: #fff;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
}

.rank-second :deep(.el-icon) {
  font-size: 16px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

.rank-third {
  background: linear-gradient(135deg, #cd7f32, #b87333);
  color: #fff;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
}

.rank-third :deep(.el-icon) {
  font-size: 16px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

.page-info {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-path {
  font-size: 12px;
  color: var(--text-color-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.visit-count {
  margin-left: 12px;
  font-weight: 500;
  color: var(--theme-color);
}

.goto-icon {
  margin-left: 8px;
  font-size: 16px;
  color: var(--theme-color);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.chart-header {
  margin-bottom: 20px;
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.title-row h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.filter-row {
  display: flex;
  align-items: center;
}

.weekday-select {
  width: 100%;
}

.weekday-select :deep(.el-select__tags) {
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.weekday-select :deep(.el-select__tags)::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.record-count {
  margin-left: 12px;
  font-size: 12px;
}

.record-count :deep(.el-tag__content) {
  color: var(--text-color-light);
}

.title-with-count {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-with-count h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.record-count {
  font-size: 12px;
  height: 24px;
  line-height: 22px;
  padding: 0 10px;
}

@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: repeat(auto-fit, minmax(calc(50% - 16px), 1fr));
  }
}

@media (max-width: 768px) {
  .activity-stats-page {
    padding: 12px;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .chart-wrapper {
    padding: 12px;
  }
  
  .chart {
    height: 250px;
  }
}
</style> 