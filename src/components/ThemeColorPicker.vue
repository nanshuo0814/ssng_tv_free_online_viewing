<template>
  <div class="theme-color-picker">
    <div class="color-picker-trigger" @click="toggleColorPicker" ref="triggerRef">
      <span class="current-color" :style="{ backgroundColor: currentColorStyle }"></span>
      <Icon name="ArrowDown" class="arrow-icon" :color="'var(--theme-color)'" />
    </div>
    <div v-if="showColorPicker" class="color-options" ref="optionsRef">
      <div 
        v-for="color in colorOptions" 
        :key="color.value" 
        class="color-option"
        :class="{ active: themeStore.themeColor === color.value }"
        @click="selectColor(color.value)"
      >
        <span class="color-dot" :style="{ backgroundColor: color.color }"></span>
        <span class="color-name">{{ color.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from '../stores/theme'
import Icon from './Icon.vue'

const themeStore = useThemeStore()
const showColorPicker = ref(false)
const triggerRef = ref(null)
const optionsRef = ref(null)

const colorOptions = [
  { name: '蓝色', value: 'blue', color: '#409eff' },
  { name: '绿色', value: 'green', color: '#67c23a' },
  { name: '紫色', value: 'purple', color: '#8e44ad' },
  { name: '红色', value: 'red', color: '#f56c6c' },
  { name: '橙色', value: 'orange', color: '#e6a23c' }
]

const currentColorStyle = computed(() => {
  const currentTheme = colorOptions.find(color => color.value === themeStore.themeColor)
  return currentTheme ? currentTheme.color : '#409eff'
})

function toggleColorPicker() {
  showColorPicker.value = !showColorPicker.value
}

function selectColor(colorValue) {
  themeStore.setThemeColor(colorValue)
  showColorPicker.value = false
}

// 点击外部关闭
function handleClickOutside(event) {
  if (
    showColorPicker.value &&
    triggerRef.value && 
    !triggerRef.value.contains(event.target) &&
    optionsRef.value && 
    !optionsRef.value.contains(event.target)
  ) {
    showColorPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.theme-color-picker {
  position: relative;
  display: inline-block;
}

.color-picker-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
  padding: 4px;
  gap: 2px;
}

.color-picker-trigger:hover {
  background-color: var(--hover-background);
}

.current-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid var(--border-color);
}

.color-options {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 5px;
  z-index: 10;
  min-width: 100px;
}

.color-option {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.color-option:hover {
  background-color: var(--hover-background);
}

.color-option.active {
  background-color: var(--hover-background);
  font-weight: 500;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 8px;
  display: inline-block;
  border: 1px solid var(--border-color);
}

.color-name {
  font-size: 14px;
  color: var(--text-color);
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style> 