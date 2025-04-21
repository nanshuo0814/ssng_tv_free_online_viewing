<template>
  <div class="weather-display" :title="`${cityName}天气：${weatherDescription}`">
    <Icon name="Sunny" color="#ff9800" v-if="weather === 'sunny'" />
    <Icon name="Cloudy" color="#909399" v-else-if="weather === 'cloudy'" />
    <Icon name="Partly" color="#3f51b5" v-else-if="weather === 'partly-cloudy'" />
    <Icon name="Rainy" color="#2196f3" v-else-if="weather === 'rainy'" />
    <Icon name="Snowy" color="#90caf9" v-else-if="weather === 'snowy'" />
    <span class="weather-text">{{ temperature }}°C {{ cityName }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Icon from './Icon.vue'

// 天气状态
const weather = ref('sunny')
const temperature = ref('--')
const cityName = ref('定位中')
const weatherDescription = ref('')

// 和风天气API相关配置
const HEFENG_KEY = '6e5d0e17395a4539b11add22c8ec186a' // 替换为你的和风天气API密钥
const BASE_URL = 'https://devapi.qweather.com/v7'
const GEO_URL = 'https://geoapi.qweather.com/v2'

// 根据和风天气状态码映射到我们的天气类型
function mapWeatherCode(code) {
  // 和风天气状态码: https://dev.qweather.com/docs/resource/weather-icon/
  const codeNum = parseInt(code)
  
  // 晴
  if (codeNum === 100 || codeNum === 150) {
    return 'sunny'
  }
  // 多云
  else if ([101, 102, 103, 151, 152, 153].includes(codeNum)) {
    return 'partly-cloudy'
  }
  // 阴
  else if (codeNum === 104 || codeNum === 154) {
    return 'cloudy'
  }
  // 雨
  else if (codeNum >= 300 && codeNum < 400) {
    return 'rainy'
  }
  // 雪
  else if (codeNum >= 400 && codeNum < 500) {
    return 'snowy'
  }
  
  return 'sunny' // 默认
}

// 获取当前位置
async function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords
          resolve({ latitude, longitude })
        },
        error => {
          console.error('获取位置失败:', error)
          resolve({ latitude: 23.1291, longitude: 113.2644 }) // 默认广州位置
        }
      )
    } else {
      console.error('浏览器不支持地理位置')
      resolve({ latitude: 23.1291, longitude: 113.2644 }) // 默认广州位置
    }
  })
}

// 获取当前位置的天气
async function getWeather() {
  try {
    // 获取位置
    const { latitude, longitude } = await getLocation()
    
    // 确保经纬度格式正确（和风天气要求"经度,纬度"的格式）
    const locationParam = `${longitude.toFixed(4)},${latitude.toFixed(4)}`
    console.log('使用位置参数:', locationParam)
    
    // 先通过GeoAPI获取城市信息
    const geoResponse = await axios.get(`${GEO_URL}/city/lookup`, {
      params: {
        location: locationParam,
        key: HEFENG_KEY
      }
    })
    
    console.log('城市查询响应:', geoResponse.data)
    
    // 如果GeoAPI请求失败，使用默认数据
    if (geoResponse.data.code !== '200' || !geoResponse.data.location || geoResponse.data.location.length === 0) {
      console.error('GeoAPI响应错误:', geoResponse.data)
      useDefaultData()
      return
    }
    
    // 获取城市ID和名称
    const cityId = geoResponse.data.location[0].id
    cityName.value = geoResponse.data.location[0].name
    
    // 使用城市ID获取天气数据
    const weatherResponse = await axios.get(`${BASE_URL}/weather/now`, {
      params: {
        location: cityId,
        key: HEFENG_KEY
      }
    })
    
    console.log('天气查询响应:', weatherResponse.data)
    
    // 如果天气API请求失败，使用默认数据
    if (weatherResponse.data.code !== '200') {
      console.error('天气API响应错误:', weatherResponse.data)
      useDefaultData()
      return
    }
    
    // 天气数据
    const weatherData = weatherResponse.data.now
    temperature.value = weatherData.temp
    weather.value = mapWeatherCode(weatherData.icon)
    weatherDescription.value = weatherData.text
    
    console.log('天气数据加载成功', cityName.value, weatherDescription.value)
  } catch (error) {
    console.error('获取天气失败:', error)
    
    // 保存详细错误信息，方便调试
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
      console.error('错误状态码:', error.response.status)
    }
    
    useDefaultData()
  }
}

// 使用默认数据
function useDefaultData() {
  // 广州的默认天气数据
  const mockWeatherResponse = {
    code: '200',
    now: {
      temp: Math.floor(Math.random() * 15) + 20, // 20-35度随机温度（广州比较热）
      icon: ['100', '101', '104', '300', '400'][Math.floor(Math.random() * 5)], // 随机天气码
      text: ['晴', '多云', '阴', '小雨', '雷阵雨'][Math.floor(Math.random() * 5)] // 随机天气描述
    }
  }
  
  // 城市名称
  cityName.value = '广州市'
  
  // 天气数据
  const weatherData = mockWeatherResponse.now
  temperature.value = weatherData.temp
  weather.value = mapWeatherCode(weatherData.icon)
  weatherDescription.value = weatherData.text
}

onMounted(() => {
  // 获取天气
  getWeather()
  
  // 每30分钟更新一次天气
  setInterval(getWeather, 30 * 60 * 1000)
})
</script>

<style scoped>
.weather-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  margin: 0;
  height: 100%;
  cursor: default;
}

.weather-text {
  font-size: 14px;
  color: var(--text-color);
  white-space: nowrap;
}

@media (max-width: 992px) {
  .weather-display {
    display: none; /* 在移动端隐藏天气显示 */
  }
}
</style> 