<template>
  <el-icon :size="size" :color="color" class="icon">
    <component :is="iconName"></component>
  </el-icon>
</template>

<script setup>
import { computed } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 22
  },
  color: {
    type: String,
    default: ''
  }
})

const iconName = computed(() => {
  // 转换图标名称为Element Plus的图标组件名
  // 例如: 'home' => 'House'
  const iconMap = {
    'home': 'House',
    'tv': 'Monitor',
    'movie': 'Film',
    'anime': 'MagicStick',
    'shorts': 'Cellphone',
    'variety': 'TrophyBase',
    'history': 'Clock',
    'search': 'Search',
    'light': 'Sunny',
    'dark': 'Moon',
    'Fold': 'Fold',
    'Expand': 'Expand',
    'Star': 'Star', // 收藏图标
    'Collection': 'Collection', // 备用收藏图标
    'Favorite': 'Star', // 改为不填充版本
    'FullScreen': 'FullScreen', // 全屏图标
    'ExitFullScreen': 'Close', // 退出全屏图标
    'ArrowDown': 'ArrowDown', // 下拉箭头
    'Palette': 'Brush', // 调色板图标
    'Bell': 'Bell', // 健康提醒图标
    // 添加天气图标
    'Sunny': 'Sunny',
    'Cloudy': 'Cloudy',
    'Partly': 'PartlyCloudy',
    'Rainy': 'Lightning',
    'Snowy': 'Cherry'
  }
  
  const name = iconMap[props.name] || props.name
  return name
})
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  vertical-align: middle;
}
</style> 