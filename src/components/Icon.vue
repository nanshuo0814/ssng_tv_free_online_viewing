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
  // 例如: 'home' => 'HomeFilled'
  const iconMap = {
    'home': 'HomeFilled',
    'tv': 'Monitor',
    'movie': 'Film',
    'anime': 'Star',
    'shorts': 'Iphone',
    'variety': 'VideoPlay',
    'history': 'Clock',
    'search': 'Search',
    'light': 'Sunny',
    'dark': 'Moon',
    'Fold': 'Fold',
    'Expand': 'Expand',
    'Star': 'Star', // 收藏图标
    'Collection': 'Collection', // 备用收藏图标
    'Favorite': 'StarFilled', // 备用收藏图标（填充版）
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