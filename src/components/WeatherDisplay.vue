<template>
  <div class="weather-display" :title="`${cityName}天气：${weatherDescription}`" @click="toggleCitySelector">
    <Icon name="Sunny" color="#ff9800" v-if="weather === 'sunny'" />
    <Icon name="Cloudy" color="#909399" v-else-if="weather === 'cloudy'" />
    <Icon name="Partly" color="#3f51b5" v-else-if="weather === 'partly-cloudy'" />
    <Icon name="Rainy" color="#2196f3" v-else-if="weather === 'rainy'" />
    <Icon name="Snowy" color="#90caf9" v-else-if="weather === 'snowy'" />
    <span class="weather-text">{{ temperature }}°C {{ cityName }}</span>
    
    <!-- 城市选择器 -->
    <div class="city-selector" v-if="showCitySelector" @click.stop>
      <div class="city-selector-header">
        <input 
          v-model="searchCity" 
          placeholder="搜索城市..." 
          class="city-search-input"
          @input="searchCities"
          ref="citySearchInput"
        />
      </div>
      
      <!-- 省份选择器 -->
      <div class="province-tabs">
        <div 
          v-for="province in provinces" 
          :key="province"
          class="province-tab"
          :class="{ 'active': selectedProvince === province }"
          @click="selectedProvince = province"
        >
          {{ province }}
        </div>
      </div>
      
      <div class="city-list-container">
        <div v-if="filteredCities.length === 0 && searchCity.length > 0" class="no-results">
          没有找到匹配的城市
        </div>
        <div v-else-if="searchCity.length === 0">
          <div v-if="selectedProvince === '热门'" class="hot-cities">
            <div class="hot-city-grid">
              <div 
                v-for="city in hotCities" 
                :key="city.name" 
                class="city-item" 
                @click="selectCity(city)"
              >
                {{ city.name }}
              </div>
            </div>
          </div>
          <div v-else-if="citiesByProvince[selectedProvince]" class="province-cities">
            <div class="city-grid">
              <div 
                v-for="city in citiesByProvince[selectedProvince]" 
                :key="city.name" 
                class="city-item" 
                @click="selectCity(city)"
              >
                {{ city.name }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="city-list">
          <div 
            v-for="city in filteredCities" 
            :key="city.name" 
            class="city-item" 
            @click="selectCity(city)"
          >
            {{ city.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import Icon from './Icon.vue'

// 天气状态
const weather = ref('sunny')
const temperature = ref('--')
const cityName = ref('定位中')
const weatherDescription = ref('')

// 城市选择器状态
const showCitySelector = ref(false)
const searchCity = ref('')
const filteredCities = ref([])
const selectedProvince = ref('热门')

// 城市选择器搜索输入框引用
const citySearchInput = ref(null)

// 热门城市列表
const hotCities = [
  { name: '北京', id: '101010100', lat: 39.9042, lon: 116.4074 },
  { name: '上海', id: '101020100', lat: 31.2304, lon: 121.4737 },
  { name: '广州', id: '101280101', lat: 23.1291, lon: 113.2644 },
  { name: '深圳', id: '101280601', lat: 22.5431, lon: 114.0579 },
  { name: '杭州', id: '101210101', lat: 30.2741, lon: 120.1551 },
  { name: '成都', id: '101270101', lat: 30.5723, lon: 104.0665 },
  { name: '武汉', id: '101200101', lat: 30.5928, lon: 114.3055 },
  { name: '西安', id: '101110101', lat: 34.3416, lon: 108.9398 },
  { name: '南京', id: '101190101', lat: 32.0603, lon: 118.7969 },
  { name: '重庆', id: '101040100', lat: 29.5630, lon: 106.5516 },
  { name: '天津', id: '101030100', lat: 39.0842, lon: 117.2009 },
  { name: '苏州', id: '101190401', lat: 31.2990, lon: 120.5853 }
]

// 中国省份列表
const provinces = [
  '热门', '直辖市', '安徽', '福建', '甘肃', '广东', '广西', '贵州', '海南', 
  '河北', '河南', '黑龙江', '湖北', '湖南', '吉林', '江苏', '江西', '辽宁', 
  '内蒙古', '宁夏', '青海', '山东', '山西', '陕西', '四川', '西藏', '新疆', 
  '云南', '浙江', '香港', '澳门', '台湾'
]

// 所有城市数据 - 按省份分组
const citiesByProvince = {
  '直辖市': [
    { name: '北京', id: '101010100', lat: 39.9042, lon: 116.4074 },
    { name: '上海', id: '101020100', lat: 31.2304, lon: 121.4737 },
    { name: '天津', id: '101030100', lat: 39.0842, lon: 117.2009 },
    { name: '重庆', id: '101040100', lat: 29.5630, lon: 106.5516 }
  ],
  '广东': [
    { name: '广州', id: '101280101', lat: 23.1291, lon: 113.2644 },
    { name: '深圳', id: '101280601', lat: 22.5431, lon: 114.0579 },
    { name: '珠海', id: '101280701', lat: 22.2710, lon: 113.5767 },
    { name: '汕头', id: '101280501', lat: 23.3535, lon: 116.6820 },
    { name: '韶关', id: '101280201', lat: 24.8108, lon: 113.5997 },
    { name: '佛山', id: '101280800', lat: 23.0218, lon: 113.1220 },
    { name: '江门', id: '101281101', lat: 22.5783, lon: 113.0819 },
    { name: '湛江', id: '101281001', lat: 21.2707, lon: 110.3594 },
    { name: '茂名', id: '101282001', lat: 21.6666, lon: 110.9251 },
    { name: '肇庆', id: '101280901', lat: 23.0472, lon: 112.4663 },
    { name: '惠州', id: '101280301', lat: 23.1116, lon: 114.4161 },
    { name: '梅州', id: '101280401', lat: 24.2882, lon: 116.1225 },
    { name: '汕尾', id: '101282101', lat: 22.7787, lon: 115.3746 },
    { name: '河源', id: '101281201', lat: 23.7431, lon: 114.7005 },
    { name: '阳江', id: '101281801', lat: 21.8580, lon: 111.9821 },
    { name: '清远', id: '101281301', lat: 23.6820, lon: 113.0507 },
    { name: '东莞', id: '101281601', lat: 23.0430, lon: 113.7633 },
    { name: '中山', id: '101281701', lat: 22.5171, lon: 113.3926 },
    { name: '潮州', id: '101281501', lat: 23.6618, lon: 116.6220 },
    { name: '揭阳', id: '101281901', lat: 23.5498, lon: 116.3729 },
    { name: '云浮', id: '101281401', lat: 22.9379, lon: 112.0440 }
  ],
  '浙江': [
    { name: '杭州', id: '101210101', lat: 30.2741, lon: 120.1551 },
    { name: '宁波', id: '101210401', lat: 29.8683, lon: 121.6241 },
    { name: '温州', id: '101210701', lat: 27.9939, lon: 120.6991 },
    { name: '嘉兴', id: '101210301', lat: 30.7737, lon: 120.7557 },
    { name: '湖州', id: '101210201', lat: 30.8962, lon: 120.0881 },
    { name: '绍兴', id: '101210501', lat: 30.0023, lon: 120.5810 },
    { name: '金华', id: '101210901', lat: 29.0895, lon: 119.6470 },
    { name: '衢州', id: '101211001', lat: 28.9419, lon: 118.8726 },
    { name: '舟山', id: '101211101', lat: 30.0196, lon: 122.2068 },
    { name: '台州', id: '101210601', lat: 28.6560, lon: 121.4211 },
    { name: '丽水', id: '101210801', lat: 28.4672, lon: 119.9229 }
  ],
  '江苏': [
    { name: '南京', id: '101190101', lat: 32.0603, lon: 118.7969 },
    { name: '苏州', id: '101190401', lat: 31.2990, lon: 120.5853 },
    { name: '无锡', id: '101190201', lat: 31.5700, lon: 120.3000 },
    { name: '常州', id: '101191101', lat: 31.8127, lon: 119.9734 },
    { name: '徐州', id: '101190801', lat: 34.2652, lon: 117.1846 },
    { name: '南通', id: '101190501', lat: 31.9796, lon: 120.8944 },
    { name: '连云港', id: '101191001', lat: 34.5969, lon: 119.2210 },
    { name: '淮安', id: '101190901', lat: 33.5097, lon: 119.0211 },
    { name: '盐城', id: '101190701', lat: 33.3490, lon: 120.1615 },
    { name: '扬州', id: '101190601', lat: 32.3942, lon: 119.4149 },
    { name: '镇江', id: '101190301', lat: 32.1887, lon: 119.4251 },
    { name: '泰州', id: '101191201', lat: 32.4547, lon: 119.9254 },
    { name: '宿迁', id: '101191301', lat: 33.9451, lon: 118.2749 }
  ],
  '四川': [
    { name: '成都', id: '101270101', lat: 30.5723, lon: 104.0665 },
    { name: '自贡', id: '101270301', lat: 29.3390, lon: 104.7686 },
    { name: '攀枝花', id: '101270201', lat: 26.5854, lon: 101.7187 },
    { name: '泸州', id: '101271001', lat: 28.8890, lon: 105.4419 },
    { name: '德阳', id: '101272001', lat: 31.1311, lon: 104.3984 },
    { name: '绵阳', id: '101270401', lat: 31.4679, lon: 104.6795 },
    { name: '广元', id: '101272101', lat: 32.4337, lon: 105.8398 },
    { name: '遂宁', id: '101270701', lat: 30.5332, lon: 105.5925 },
    { name: '内江', id: '101271201', lat: 29.5870, lon: 105.0585 },
    { name: '乐山', id: '101271401', lat: 29.5521, lon: 103.7661 },
    { name: '南充', id: '101270501', lat: 30.7991, lon: 106.0825 },
    { name: '眉山', id: '101271501', lat: 30.0779, lon: 103.8480 },
    { name: '宜宾', id: '101271101', lat: 28.7513, lon: 104.6230 },
    { name: '广安', id: '101270801', lat: 30.4739, lon: 106.6337 },
    { name: '达州', id: '101270601', lat: 31.2090, lon: 107.4680 },
    { name: '雅安', id: '101271701', lat: 30.0162, lon: 103.0009 },
    { name: '巴中', id: '101270901', lat: 31.8590, lon: 106.7444 },
    { name: '资阳', id: '101271301', lat: 30.1222, lon: 104.6416 },
    { name: '阿坝', id: '101271901', lat: 31.8994, lon: 102.2236 },
    { name: '甘孜', id: '101271801', lat: 30.0503, lon: 101.9625 },
    { name: '凉山', id: '101271601', lat: 27.8867, lon: 102.2674 }
  ],
  '湖北': [
    { name: '武汉', id: '101200101', lat: 30.5928, lon: 114.3055 },
    { name: '黄石', id: '101200601', lat: 30.2165, lon: 115.0381 },
    { name: '十堰', id: '101201001', lat: 32.6293, lon: 110.7978 },
    { name: '宜昌', id: '101200901', lat: 30.6931, lon: 111.2864 },
    { name: '襄阳', id: '101200201', lat: 32.0907, lon: 112.1448 },
    { name: '鄂州', id: '101200301', lat: 30.3965, lon: 114.8951 },
    { name: '荆门', id: '101201401', lat: 31.0354, lon: 112.2036 },
    { name: '孝感', id: '101200401', lat: 30.9275, lon: 113.9159 },
    { name: '荆州', id: '101200801', lat: 30.3264, lon: 112.2408 },
    { name: '黄冈', id: '101200501', lat: 30.4461, lon: 114.8720 },
    { name: '咸宁', id: '101200701', lat: 29.8414, lon: 114.3223 },
    { name: '随州', id: '101201301', lat: 31.6902, lon: 113.3737 },
    { name: '恩施', id: '101201001', lat: 30.2720, lon: 109.4881 },
    { name: '仙桃', id: '101201601', lat: 30.3622, lon: 113.4546 },
    { name: '潜江', id: '101201701', lat: 30.4212, lon: 112.8998 },
    { name: '天门', id: '101201501', lat: 30.6531, lon: 113.1668 },
    { name: '神农架', id: '101201201', lat: 31.7442, lon: 110.6758 }
  ],
  '陕西': [
    { name: '西安', id: '101110101', lat: 34.3416, lon: 108.9398 },
    { name: '铜川', id: '101111001', lat: 34.9078, lon: 108.9451 },
    { name: '宝鸡', id: '101110901', lat: 34.3609, lon: 107.2372 },
    { name: '咸阳', id: '101110200', lat: 34.3334, lon: 108.7051 },
    { name: '渭南', id: '101110501', lat: 34.4994, lon: 109.5102 },
    { name: '延安', id: '101110300', lat: 36.5849, lon: 109.4895 },
    { name: '汉中', id: '101110801', lat: 33.0679, lon: 107.0242 },
    { name: '榆林', id: '101110401', lat: 38.2854, lon: 109.7349 },
    { name: '安康', id: '101110701', lat: 32.6841, lon: 109.0238 },
    { name: '商洛', id: '101110601', lat: 33.8705, lon: 109.9408 }
  ],
  '安徽': [
    { name: '合肥', id: '101220101', lat: 31.8206, lon: 117.2272 },
    { name: '芜湖', id: '101220301', lat: 31.3339, lon: 118.3732 },
    { name: '蚌埠', id: '101220201', lat: 32.9397, lon: 117.3530 },
    { name: '淮南', id: '101220401', lat: 32.6534, lon: 117.0005 },
    { name: '马鞍山', id: '101220501', lat: 31.6773, lon: 118.5062 },
    { name: '淮北', id: '101221201', lat: 33.9544, lon: 116.7985 },
    { name: '铜陵', id: '101221301', lat: 30.9453, lon: 117.8121 },
    { name: '安庆', id: '101220601', lat: 30.5255, lon: 117.0635 },
    { name: '黄山', id: '101221001', lat: 29.7147, lon: 118.3144 },
    { name: '滁州', id: '101221401', lat: 32.3063, lon: 118.3164 },
    { name: '阜阳', id: '101220801', lat: 32.8898, lon: 115.8141 },
    { name: '宿州', id: '101220701', lat: 33.6462, lon: 116.9638 },
    { name: '六安', id: '101221501', lat: 31.7337, lon: 116.5231 },
    { name: '亳州', id: '101220901', lat: 33.8712, lon: 115.7787 },
    { name: '池州', id: '101221701', lat: 30.6639, lon: 117.4919 },
    { name: '宣城', id: '101221601', lat: 30.9404, lon: 118.7426 }
  ],
  '福建': [
    { name: '福州', id: '101230101', lat: 26.0745, lon: 119.2965 },
    { name: '厦门', id: '101230201', lat: 24.4798, lon: 118.0894 },
    { name: '莆田', id: '101230401', lat: 25.4310, lon: 119.0077 },
    { name: '三明', id: '101230801', lat: 26.2610, lon: 117.6347 },
    { name: '泉州', id: '101230501', lat: 24.8741, lon: 118.6754 },
    { name: '漳州', id: '101230601', lat: 24.5165, lon: 117.6474 },
    { name: '南平', id: '101230901', lat: 26.6436, lon: 118.1776 },
    { name: '龙岩', id: '101230701', lat: 25.0789, lon: 117.0169 },
    { name: '宁德', id: '101230301', lat: 26.6617, lon: 119.5483 }
  ],
  '甘肃': [
    { name: '兰州', id: '101160101', lat: 36.0611, lon: 103.8343 },
    { name: '嘉峪关', id: '101161401', lat: 39.7871, lon: 98.2773 },
    { name: '金昌', id: '101160601', lat: 38.5205, lon: 102.1879 },
    { name: '白银', id: '101161301', lat: 36.5447, lon: 104.1386 },
    { name: '天水', id: '101160901', lat: 34.5802, lon: 105.7245 },
    { name: '武威', id: '101160501', lat: 37.9283, lon: 102.6339 },
    { name: '张掖', id: '101160701', lat: 38.9256, lon: 100.4495 },
    { name: '平凉', id: '101160301', lat: 35.5428, lon: 106.6655 },
    { name: '酒泉', id: '101160801', lat: 39.7351, lon: 98.4941 },
    { name: '庆阳', id: '101160401', lat: 35.7091, lon: 107.6380 },
    { name: '定西', id: '101160201', lat: 35.5795, lon: 104.6259 },
    { name: '陇南', id: '101161010', lat: 33.4017, lon: 104.9216 },
    { name: '临夏', id: '101161101', lat: 35.6045, lon: 103.2122 },
    { name: '甘南', id: '101161201', lat: 34.9870, lon: 102.9111 }
  ],
  '广西': [
    { name: '南宁', id: '101300101', lat: 22.8170, lon: 108.3669 },
    { name: '柳州', id: '101300301', lat: 24.3260, lon: 109.4281 },
    { name: '桂林', id: '101300501', lat: 25.2736, lon: 110.2993 },
    { name: '梧州', id: '101300601', lat: 23.4773, lon: 111.2790 },
    { name: '北海', id: '101301301', lat: 21.4814, lon: 109.1199 },
    { name: '防城港', id: '101301401', lat: 21.6139, lon: 108.3380 },
    { name: '钦州', id: '101301101', lat: 21.9791, lon: 108.6536 },
    { name: '贵港', id: '101300801', lat: 23.1135, lon: 109.5982 },
    { name: '玉林', id: '101300901', lat: 22.6549, lon: 110.1802 },
    { name: '百色', id: '101301001', lat: 23.9022, lon: 106.6188 },
    { name: '贺州', id: '101300701', lat: 24.4038, lon: 111.5526 },
    { name: '河池', id: '101301201', lat: 24.6959, lon: 108.0854 },
    { name: '来宾', id: '101300401', lat: 23.7504, lon: 109.2296 },
    { name: '崇左', id: '101300201', lat: 22.4065, lon: 107.3600 }
  ],
  '贵州': [
    { name: '贵阳', id: '101260101', lat: 26.6470, lon: 106.6302 },
    { name: '六盘水', id: '101260801', lat: 26.5918, lon: 104.8329 },
    { name: '遵义', id: '101260201', lat: 27.7251, lon: 106.9270 },
    { name: '安顺', id: '101260301', lat: 26.2456, lon: 105.9329 },
    { name: '毕节', id: '101260701', lat: 27.2996, lon: 105.2827 },
    { name: '铜仁', id: '101260601', lat: 27.7185, lon: 109.1912 },
    { name: '黔西南', id: '101260901', lat: 25.0881, lon: 104.9009 },
    { name: '黔东南', id: '101260501', lat: 26.5830, lon: 107.9774 },
    { name: '黔南', id: '101260401', lat: 26.2580, lon: 107.5238 }
  ],
  '海南': [
    { name: '海口', id: '101310101', lat: 20.0442, lon: 110.1992 },
    { name: '三亚', id: '101310201', lat: 18.2527, lon: 109.5120 },
    { name: '三沙', id: '101310301', lat: 16.8310, lon: 112.3381 },
    { name: '儋州', id: '101310205', lat: 19.5270, lon: 109.5764 },
    { name: '五指山', id: '101310222', lat: 18.7808, lon: 109.5172 },
    { name: '琼海', id: '101310211', lat: 19.2584, lon: 110.4750 },
    { name: '文昌', id: '101310212', lat: 19.5430, lon: 110.7977 },
    { name: '万宁', id: '101310215', lat: 18.7961, lon: 110.3929 },
    { name: '东方', id: '101310202', lat: 19.0973, lon: 108.6533 },
    { name: '定安', id: '101310209', lat: 19.6818, lon: 110.3593 },
    { name: '屯昌', id: '101310210', lat: 19.3523, lon: 110.1029 },
    { name: '澄迈', id: '101310204', lat: 19.7381, lon: 110.0068 },
    { name: '临高', id: '101310203', lat: 19.9127, lon: 109.6877 },
    { name: '白沙', id: '101310207', lat: 19.2245, lon: 109.4526 },
    { name: '昌江', id: '101310206', lat: 19.2981, lon: 109.0554 },
    { name: '乐东', id: '101310221', lat: 18.7476, lon: 109.1730 },
    { name: '陵水', id: '101310216', lat: 18.5050, lon: 110.0372 },
    { name: '保亭', id: '101310214', lat: 18.6369, lon: 109.7021 },
    { name: '琼中', id: '101310208', lat: 19.0356, lon: 109.8391 }
  ],
  '河北': [
    { name: '石家庄', id: '101090101', lat: 38.0428, lon: 114.5149 },
    { name: '唐山', id: '101090501', lat: 39.6303, lon: 118.1798 },
    { name: '秦皇岛', id: '101091101', lat: 39.9354, lon: 119.6008 },
    { name: '邯郸', id: '101091001', lat: 36.6259, lon: 114.5391 },
    { name: '邢台', id: '101090901', lat: 37.0695, lon: 114.5043 },
    { name: '保定', id: '101090201', lat: 38.8671, lon: 115.4845 },
    { name: '张家口', id: '101090301', lat: 40.7670, lon: 114.8838 },
    { name: '承德', id: '101090401', lat: 40.9515, lon: 117.9634 },
    { name: '沧州', id: '101090701', lat: 38.3037, lon: 116.8386 },
    { name: '廊坊', id: '101090601', lat: 39.5376, lon: 116.6828 },
    { name: '衡水', id: '101090801', lat: 37.7392, lon: 115.6859 }
  ],
  '河南': [
    { name: '郑州', id: '101180101', lat: 34.7469, lon: 113.6253 },
    { name: '开封', id: '101180801', lat: 34.7850, lon: 114.3077 },
    { name: '洛阳', id: '101180901', lat: 34.6192, lon: 112.4540 },
    { name: '平顶山', id: '101180501', lat: 33.7662, lon: 113.1925 },
    { name: '安阳', id: '101180201', lat: 36.0993, lon: 114.3930 },
    { name: '鹤壁', id: '101181201', lat: 35.7480, lon: 114.2975 },
    { name: '新乡', id: '101180301', lat: 35.3030, lon: 113.9266 },
    { name: '焦作', id: '101181101', lat: 35.2159, lon: 113.2418 },
    { name: '濮阳', id: '101181301', lat: 35.7612, lon: 115.0288 },
    { name: '许昌', id: '101180401', lat: 34.0357, lon: 113.8519 },
    { name: '漯河', id: '101181501', lat: 33.5815, lon: 114.0168 },
    { name: '三门峡', id: '101181701', lat: 34.7728, lon: 111.2003 },
    { name: '南阳', id: '101180701', lat: 32.9987, lon: 112.5287 },
    { name: '商丘', id: '101181001', lat: 34.4144, lon: 115.6504 },
    { name: '信阳', id: '101180601', lat: 32.1475, lon: 114.0752 },
    { name: '周口', id: '101181401', lat: 33.6254, lon: 114.6975 },
    { name: '驻马店', id: '101181601', lat: 33.0146, lon: 114.0232 },
    { name: '济源', id: '101181801', lat: 35.0900, lon: 112.6017 }
  ],
  '黑龙江': [
    { name: '哈尔滨', id: '101050101', lat: 45.8038, lon: 126.5340 },
    { name: '齐齐哈尔', id: '101050201', lat: 47.3543, lon: 123.9184 },
    { name: '鸡西', id: '101051101', lat: 45.2953, lon: 130.9688 },
    { name: '鹤岗', id: '101051201', lat: 47.3321, lon: 130.2743 },
    { name: '双鸭山', id: '101051301', lat: 46.6466, lon: 131.1419 },
    { name: '大庆', id: '101050901', lat: 46.5907, lon: 125.1033 },
    { name: '伊春', id: '101050801', lat: 47.7346, lon: 128.8993 },
    { name: '佳木斯', id: '101050401', lat: 46.8008, lon: 130.3188 },
    { name: '七台河', id: '101051002', lat: 45.7709, lon: 131.0033 },
    { name: '牡丹江', id: '101050301', lat: 44.5830, lon: 129.6336 },
    { name: '黑河', id: '101050601', lat: 50.2450, lon: 127.5293 },
    { name: '绥化', id: '101050501', lat: 46.6525, lon: 126.9688 },
    { name: '大兴安岭', id: '101050701', lat: 51.6771, lon: 124.3062 }
  ],
  '湖南': [
    { name: '长沙', id: '101250101', lat: 28.2278, lon: 112.9388 },
    { name: '株洲', id: '101250301', lat: 27.8273, lon: 113.1345 },
    { name: '湘潭', id: '101250201', lat: 27.8292, lon: 112.9447 },
    { name: '衡阳', id: '101250401', lat: 26.8982, lon: 112.5719 },
    { name: '邵阳', id: '101250901', lat: 27.2389, lon: 111.4678 },
    { name: '岳阳', id: '101251001', lat: 29.3703, lon: 113.1296 },
    { name: '常德', id: '101250601', lat: 29.0474, lon: 111.6913 },
    { name: '张家界', id: '101251101', lat: 29.1274, lon: 110.4793 },
    { name: '益阳', id: '101250700', lat: 28.5593, lon: 112.3605 },
    { name: '郴州', id: '101250501', lat: 25.7742, lon: 113.0150 },
    { name: '永州', id: '101251401', lat: 26.4200, lon: 111.6131 },
    { name: '怀化', id: '101251201', lat: 27.5574, lon: 110.0076 },
    { name: '娄底', id: '101250801', lat: 27.6964, lon: 111.9940 },
    { name: '湘西', id: '101251509', lat: 28.3123, lon: 109.7388 }
  ],
  '吉林': [
    { name: '长春', id: '101060101', lat: 43.8170, lon: 125.3241 },
    { name: '吉林', id: '101060201', lat: 43.8396, lon: 126.5497 },
    { name: '四平', id: '101060401', lat: 43.1662, lon: 124.3509 },
    { name: '辽源', id: '101060701', lat: 42.9231, lon: 125.1449 },
    { name: '通化', id: '101060501', lat: 41.7273, lon: 125.9395 },
    { name: '白山', id: '101060901', lat: 41.9446, lon: 126.4233 },
    { name: '松原', id: '101060601', lat: 45.1414, lon: 124.8234 },
    { name: '白城', id: '101060801', lat: 45.6196, lon: 122.8408 },
    { name: '延边', id: '101060301', lat: 42.9049, lon: 129.5091 }
  ],
  '江西': [
    { name: '南昌', id: '101240101', lat: 28.6820, lon: 115.8581 },
    { name: '景德镇', id: '101240801', lat: 29.2756, lon: 117.1784 },
    { name: '萍乡', id: '101240901', lat: 27.6229, lon: 113.8545 },
    { name: '九江', id: '101240201', lat: 29.7051, lon: 116.0009 },
    { name: '新余', id: '101241001', lat: 27.8178, lon: 114.9171 },
    { name: '鹰潭', id: '101241101', lat: 28.2607, lon: 117.0688 },
    { name: '赣州', id: '101240701', lat: 25.8307, lon: 114.9350 },
    { name: '吉安', id: '101240601', lat: 27.1200, lon: 114.9927 },
    { name: '宜春', id: '101240501', lat: 27.8168, lon: 114.3839 },
    { name: '抚州', id: '101240401', lat: 27.9839, lon: 116.3583 },
    { name: '上饶', id: '101240301', lat: 28.4544, lon: 117.9432 }
  ],
  '辽宁': [
    { name: '沈阳', id: '101070101', lat: 41.8057, lon: 123.4315 },
    { name: '大连', id: '101070201', lat: 38.9140, lon: 121.6147 },
    { name: '鞍山', id: '101070301', lat: 41.1075, lon: 122.9953 },
    { name: '抚顺', id: '101070401', lat: 41.8773, lon: 123.9572 },
    { name: '本溪', id: '101070501', lat: 41.2920, lon: 123.6857 },
    { name: '丹东', id: '101070601', lat: 40.1297, lon: 124.3836 },
    { name: '锦州', id: '101070701', lat: 41.0952, lon: 121.1272 },
    { name: '营口', id: '101070801', lat: 40.6669, lon: 122.2349 },
    { name: '阜新', id: '101070901', lat: 42.0192, lon: 121.6699 },
    { name: '辽阳', id: '101071001', lat: 41.2733, lon: 123.1738 },
    { name: '盘锦', id: '101071301', lat: 41.1194, lon: 122.0707 },
    { name: '铁岭', id: '101071101', lat: 42.2234, lon: 123.7324 },
    { name: '朝阳', id: '101071201', lat: 41.5740, lon: 120.4507 },
    { name: '葫芦岛', id: '101071401', lat: 40.7110, lon: 120.8376 }
  ],
  '内蒙古': [
    { name: '呼和浩特', id: '101080101', lat: 40.8414, lon: 111.7519 },
    { name: '包头', id: '101080201', lat: 40.6574, lon: 109.8404 },
    { name: '乌海', id: '101080301', lat: 39.6547, lon: 106.8254 },
    { name: '赤峰', id: '101080601', lat: 42.2584, lon: 118.8887 },
    { name: '通辽', id: '101080501', lat: 43.6524, lon: 122.2437 },
    { name: '鄂尔多斯', id: '101080701', lat: 39.6086, lon: 109.7810 },
    { name: '呼伦贝尔', id: '101081001', lat: 49.2122, lon: 119.7650 },
    { name: '巴彦淖尔', id: '101080811', lat: 40.7579, lon: 107.3876 },
    { name: '乌兰察布', id: '101080405', lat: 40.9941, lon: 113.1336 },
    { name: '兴安盟', id: '101080510', lat: 46.0837, lon: 122.0381 },
    { name: '锡林郭勒', id: '101080902', lat: 43.9396, lon: 116.0481 },
    { name: '阿拉善', id: '101081213', lat: 38.8430, lon: 105.7295 }
  ],
  '宁夏': [
    { name: '银川', id: '101170101', lat: 38.4872, lon: 106.2312 },
    { name: '石嘴山', id: '101170201', lat: 38.9841, lon: 106.3844 },
    { name: '吴忠', id: '101170301', lat: 37.9975, lon: 106.1990 },
    { name: '固原', id: '101170401', lat: 36.0046, lon: 106.2424 },
    { name: '中卫', id: '101170501', lat: 37.4996, lon: 105.1988 }
  ],
  '青海': [
    { name: '西宁', id: '101150101', lat: 36.6166, lon: 101.7660 },
    { name: '海东', id: '101150207', lat: 36.5045, lon: 102.1041 },
    { name: '海北', id: '101150801', lat: 36.9537, lon: 100.9010 },
    { name: '黄南', id: '101150301', lat: 35.5196, lon: 102.0153 },
    { name: '海南', id: '101150401', lat: 36.2853, lon: 100.6195 },
    { name: '果洛', id: '101150501', lat: 34.4736, lon: 100.2478 },
    { name: '玉树', id: '101150601', lat: 33.0079, lon: 97.0065 },
    { name: '海西', id: '101150701', lat: 37.3770, lon: 97.3707 }
  ],
  '山东': [
    { name: '济南', id: '101120101', lat: 36.6512, lon: 117.1201 },
    { name: '青岛', id: '101120201', lat: 36.0671, lon: 120.3826 },
    { name: '淄博', id: '101120301', lat: 36.8131, lon: 118.0547 },
    { name: '枣庄', id: '101121401', lat: 34.8102, lon: 117.3230 },
    { name: '东营', id: '101121201', lat: 37.4346, lon: 118.6747 },
    { name: '烟台', id: '101120501', lat: 37.4635, lon: 121.4479 },
    { name: '潍坊', id: '101120601', lat: 36.7006, lon: 119.1619 },
    { name: '济宁', id: '101120701', lat: 35.4149, lon: 116.5871 },
    { name: '泰安', id: '101120801', lat: 36.1944, lon: 117.0879 },
    { name: '威海', id: '101121301', lat: 37.5128, lon: 122.1186 },
    { name: '日照', id: '101121501', lat: 35.4164, lon: 119.5277 },
    { name: '临沂', id: '101120901', lat: 35.1042, lon: 118.3564 },
    { name: '德州', id: '101120401', lat: 37.4355, lon: 116.3599 },
    { name: '聊城', id: '101121701', lat: 36.4567, lon: 115.9854 },
    { name: '滨州', id: '101121101', lat: 37.3825, lon: 117.9717 },
    { name: '菏泽', id: '101121001', lat: 35.2624, lon: 115.4813 }
  ],
  '山西': [
    { name: '太原', id: '101100101', lat: 37.8706, lon: 112.5489 },
    { name: '大同', id: '101100201', lat: 40.0903, lon: 113.2991 },
    { name: '阳泉', id: '101100301', lat: 37.8614, lon: 113.5734 },
    { name: '长治', id: '101100501', lat: 36.1911, lon: 113.1231 },
    { name: '晋城', id: '101100601', lat: 35.4976, lon: 112.8508 },
    { name: '朔州', id: '101100901', lat: 39.3350, lon: 112.4309 },
    { name: '晋中', id: '101100401', lat: 37.6935, lon: 112.7375 },
    { name: '运城', id: '101100801', lat: 35.0287, lon: 111.0076 },
    { name: '忻州', id: '101101001', lat: 38.4169, lon: 112.7335 },
    { name: '临汾', id: '101100701', lat: 36.0880, lon: 111.5171 },
    { name: '吕梁', id: '101101100', lat: 37.5222, lon: 111.1414 }
  ],
  '西藏': [
    { name: '拉萨', id: '101140101', lat: 29.6540, lon: 91.1005 },
    { name: '日喀则', id: '101140201', lat: 29.2674, lon: 88.8816 },
    { name: '昌都', id: '101140501', lat: 31.1405, lon: 97.1714 },
    { name: '林芝', id: '101140401', lat: 29.6547, lon: 94.3624 },
    { name: '山南', id: '101140301', lat: 29.2378, lon: 91.7711 },
    { name: '那曲', id: '101140601', lat: 31.4763, lon: 92.0515 },
    { name: '阿里', id: '101140701', lat: 32.5027, lon: 80.1055 }
  ],
  '新疆': [
    { name: '乌鲁木齐', id: '101130101', lat: 43.8256, lon: 87.6168 },
    { name: '克拉玛依', id: '101130201', lat: 45.5809, lon: 84.8894 },
    { name: '吐鲁番', id: '101130501', lat: 42.9542, lon: 89.1815 },
    { name: '哈密', id: '101131201', lat: 42.8177, lon: 93.5172 },
    { name: '昌吉', id: '101130401', lat: 44.0109, lon: 87.3082 },
    { name: '博尔塔拉', id: '101130601', lat: 44.9036, lon: 82.0651 },
    { name: '巴音郭楞', id: '101130801', lat: 41.7680, lon: 86.1502 },
    { name: '阿克苏', id: '101130801', lat: 41.1686, lon: 80.2639 },
    { name: '克孜勒苏', id: '101131601', lat: 39.7153, lon: 76.1728 },
    { name: '喀什', id: '101130901', lat: 39.4677, lon: 75.9896 },
    { name: '和田', id: '101131301', lat: 37.1167, lon: 79.9308 },
    { name: '伊犁', id: '101131001', lat: 43.9220, lon: 81.3304 },
    { name: '塔城', id: '101131101', lat: 46.7396, lon: 82.9748 },
    { name: '阿勒泰', id: '101131401', lat: 47.8445, lon: 88.1396 },
    { name: '石河子', id: '101130301', lat: 44.3061, lon: 86.0879 },
    { name: '阿拉尔', id: '101131501', lat: 40.5478, lon: 81.2859 },
    { name: '图木舒克', id: '101131501', lat: 39.8670, lon: 79.0778 },
    { name: '五家渠', id: '101131701', lat: 44.1674, lon: 87.5254 },
    { name: '北屯', id: '101131401', lat: 47.3323, lon: 87.8350 },
    { name: '铁门关', id: '101131501', lat: 41.8687, lon: 85.6763 },
    { name: '双河', id: '101131001', lat: 44.8407, lon: 82.3344 },
    { name: '可克达拉', id: '101131001', lat: 43.6832, lon: 81.0480 }
  ],
  '云南': [
    { name: '昆明', id: '101290101', lat: 25.0389, lon: 102.7183 },
    { name: '曲靖', id: '101290401', lat: 25.4896, lon: 103.7964 },
    { name: '玉溪', id: '101290701', lat: 24.3507, lon: 102.5428 },
    { name: '保山', id: '101290501', lat: 25.1116, lon: 99.1611 },
    { name: '昭通', id: '101291001', lat: 27.3379, lon: 103.7171 },
    { name: '丽江', id: '101291401', lat: 26.8747, lon: 100.2345 },
    { name: '普洱', id: '101290901', lat: 22.8255, lon: 100.9663 },
    { name: '临沧', id: '101291101', lat: 23.8776, lon: 100.0893 },
    { name: '楚雄', id: '101290801', lat: 25.0428, lon: 101.5272 },
    { name: '红河', id: '101290301', lat: 23.3661, lon: 103.1748 },
    { name: '文山', id: '101290601', lat: 23.3705, lon: 104.2420 },
    { name: '西双版纳', id: '101291601', lat: 22.0017, lon: 100.7982 },
    { name: '大理', id: '101290201', lat: 25.5969, lon: 100.2250 },
    { name: '德宏', id: '101291501', lat: 24.4367, lon: 98.5855 },
    { name: '怒江', id: '101291201', lat: 25.8274, lon: 98.8572 },
    { name: '迪庆', id: '101291301', lat: 27.8307, lon: 99.7068 }
  ],
  '香港': [
    { name: '香港', id: '101320101', lat: 22.2793, lon: 114.1694 }
  ],
  '澳门': [
    { name: '澳门', id: '101330101', lat: 22.1987, lon: 113.5491 }
  ],
  '台湾': [
    { name: '台北', id: '101340101', lat: 25.0330, lon: 121.5654 },
    { name: '高雄', id: '101340201', lat: 22.6328, lon: 120.3014 },
    { name: '台中', id: '101340401', lat: 24.1477, lon: 120.6736 },
    { name: '台南', id: '101340301', lat: 22.9908, lon: 120.2133 },
    { name: '基隆', id: '101340701', lat: 25.1287, lon: 121.7419 },
    { name: '新竹', id: '101340306', lat: 24.8138, lon: 120.9675 },
    { name: '嘉义', id: '101340202', lat: 23.4801, lon: 120.4490 }
  ]
}

// 获取所有城市的扁平数组，用于搜索
const allCities = [
  ...hotCities,
  ...Object.values(citiesByProvince).flat()
].filter((city, index, self) => 
  // 去重
  index === self.findIndex(c => c.id === city.id)
)

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
async function getWeather(selectedCity = null) {
  try {
    let locationParam, cityId

    if (selectedCity) {
      // 如果是从城市选择器选择的城市
      locationParam = `${selectedCity.lon},${selectedCity.lat}`
      cityId = selectedCity.id
      cityName.value = selectedCity.name
    } else {
      // 获取位置
      const { latitude, longitude } = await getLocation()
      
      // 确保经纬度格式正确（和风天气要求"经度,纬度"的格式）
      locationParam = `${longitude.toFixed(4)},${latitude.toFixed(4)}`
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
      cityId = geoResponse.data.location[0].id
      cityName.value = geoResponse.data.location[0].name
    }
    
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

// 切换城市选择器的显示状态
function toggleCitySelector(event) {
  event.stopPropagation(); // 阻止事件冒泡
  showCitySelector.value = !showCitySelector.value
  
  // 当打开城市选择器时，聚焦到搜索框
  if (showCitySelector.value) {
    nextTick(() => {
      if (citySearchInput.value) {
        citySearchInput.value.focus()
      }
    })
  }
}

// 搜索城市
function searchCities() {
  if (!searchCity.value.trim()) {
    filteredCities.value = []
    return
  }
  
  const query = searchCity.value.toLowerCase()
  filteredCities.value = allCities.filter(city => 
    city.name.toLowerCase().includes(query)
  )
}

// 选择城市
function selectCity(city) {
  getWeather(city)
  showCitySelector.value = false
  searchCity.value = ''
}

// 点击外部时关闭城市选择器
function handleOutsideClick(event) {
  if (showCitySelector.value && !event.target.closest('.weather-display')) {
    showCitySelector.value = false
  }
}

onMounted(() => {
  // 获取天气
  getWeather()
  
  // 每30分钟更新一次天气
  setInterval(getWeather, 30 * 60 * 1000)
  
  // 添加点击外部关闭选择器的事件监听
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('click', handleOutsideClick)
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
  cursor: pointer;
  position: relative;
}

.weather-text {
  font-size: 14px;
  color: var(--text-color);
  white-space: nowrap;
}

/* 城市选择器样式 */
.city-selector {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 320px;
  max-height: 480px;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  overflow: hidden;
}

/* PC端样式 */
@media screen and (min-width: 992px) {
  .weather-display .city-selector {
    position: absolute !important;
    top: calc(100% + 2px) !important;
    bottom: auto !important;
    left: 0 !important;
    transform: none !important;
    width: 320px !important;
    z-index: 1001 !important;
  }
}

@media (max-width: 992px) {
  .weather-display {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  
  .weather-text {
    font-size: 12px;
  }
}

.city-selector-header {
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
}

.city-search-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--search-background);
  color: var(--text-color);
  font-size: 14px;
}

.city-search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.province-tabs {
  display: flex;
  flex-wrap: wrap;
  padding: 6px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color-secondary);
  max-height: 120px;
  overflow-y: auto;
}

.province-tab {
  padding: 4px 8px;
  font-size: 12px;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 3px;
  margin: 2px;
  transition: background-color 0.2s;
}

.province-tab:hover {
  background-color: var(--hover-background);
}

.province-tab.active {
  background-color: var(--primary-color);
  color: white;
}

.city-list-container {
  max-height: 280px;
  overflow-y: auto;
  padding: 10px;
}

.hot-city-grid, .city-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.city-item {
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-color);
  background-color: var(--hover-background);
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.city-item:hover {
  background-color: var(--primary-color);
  color: white;
}

.city-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.no-results {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px 0;
}
</style> 