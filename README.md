# 烁烁南光在线免费影视

[![GitHub stars](https://img.shields.io/github/stars/nanshuo0814/ssng_tv_free_online_viewing?style=social)](https://github.com/nanshuo0814/ssng_tv_free_online_viewing)
[![GitHub forks](https://img.shields.io/github/forks/nanshuo0814/ssng_tv_free_online_viewing?style=social)](https://github.com/nanshuo0814/ssng_tv_free_online_viewing)
[![GitHub last commit](https://img.shields.io/github/last-commit/nanshuo0814/ssng_tv_free_online_viewing)](https://github.com/nanshuo0814/ssng_tv_free_online_viewing)
[![GitHub issues](https://img.shields.io/github/issues/nanshuo0814/ssng_tv_free_online_viewing)](https://github.com/nanshuo0814/ssng_tv_free_online_viewing/issues)
[![Vue](https://img.shields.io/badge/Vue.js-3.3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?logo=vite)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.3.9-409EFF?logo=element)](https://element-plus.org/)
[![Pinia](https://img.shields.io/badge/Pinia-2.1.6-F7D336?logo=pinia)](https://pinia.vuejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<div align="center">
  <img src="src/assets/ssng.png" alt="烁烁南光在线免费影视" width="200" />
  <h3>优雅，高效，易用的在线影视观影平台</h3>
</div>

## 项目介绍

烁烁南光在线免费影视是一个基于Vue 3开发的影视在线播放平台，提供电影、电视剧、动漫、短剧、综艺等内容的在线观看服务。平台采用现代化的前端技术栈，提供流畅的用户体验和丰富的功能特性。

本项目仅用于学习交流使用，严禁用于商业用途。如果您喜欢所观看的影片，请支持正版。

## 在线预览

- [点击访问演示站点](https://tv.nanshuo.icu)

## 技术栈

- **前端框架**: Vue 3.3.4 (Composition API)
- **构建工具**: Vite 4.4.5
- **UI 组件库**: Element Plus 2.3.9
- **状态管理**: Pinia 2.1.6 + pinia-plugin-persistedstate 4.3.0
- **路由管理**: Vue Router 4.2.4
- **HTTP 请求**: Axios 1.8.4
- **视频播放**: Artplayer 5.2.3 + HLS.js 1.6.2
- **图表库**: ECharts 5.6.0
- **工具库**: @vueuse/core 13.2.0, html2canvas 1.4.1, qrcode.vue 3.6.0
- **评论系统**: Twikoo 1.6.44
- **进度条**: NProgress 0.2.0
- **数据存储**: LeanCloud Storage 4.15.2
- **字体图标**: @element-plus/icons-vue 2.1.0

## ✨ 功能特点

### 🎬 视频播放功能
- **多源切换**: 支持黑木耳、爱坤、卧龙、华为、360、急速等多个播放源，无缝切换
- **智能解析**: 自动识别视频格式并选择最佳播放方式
- **高级播放器**: 画中画、全屏播放、倍速调节
- **播放记忆**: 自动记住上次播放位置
- **异步加载**: 播放源懒加载技术，提高页面响应速度
- **自动重试**: 播放失败时智能重试，提升播放成功率

### 🎨 用户界面
- **自适应布局**: 完美支持PC、平板、手机等多种设备，UI自动适配
- **深色/浅色模式**: 智能切换，保护视力
- **自定义主题**: 支持蓝色、绿色、紫色、红色、橙色等多种主题色
- **实时天气**: 支持全国城市天气显示
- **实时时钟**: 显示当前时间
- **进度指示**: 页面加载进度条
- **流畅动画**: 页面过渡和交互动画

### 📱 用户体验
- **快速搜索**: 支持模糊搜索、搜索历史记录
- **分类浏览**: 支持电影、电视剧、动漫、短剧、综艺等分类
- **个人中心**: 收藏夹、历史记录、系统设置
- **活动统计**: 用户活动时长统计和分析
- **健康提醒**: 观影时长提醒，保护视力
- **评论系统**: 基于Twikoo的影片评论功能

### 🔧 系统性能
- **请求优化**: 资源请求批处理和并发控制
- **延迟加载**: 优化首屏加载速度
- **缓存策略**: 合理利用浏览器缓存，减少网络请求
- **错误恢复**: 请求失败自动重试，提高系统可靠性
- **超时控制**: 请求超时处理，避免长时间等待
- **异步数据流**: 非阻塞加载，提升用户体验

## 🚀 快速开始

### 环境准备
- Node.js >= 16.0.0
- npm >= 7.0.0
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/nanshuo0814/ssng_tv_free_online_viewing.git
cd ssng_tv_free_online_viewing
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

5. 预览生产版本
```bash
npm run preview
```

## 📂项目结构

```
src/
├── assets/           # 静态资源
│   ├── icons/       # 图标资源
│   ├── styles/      # 全局样式
│   └── *.svg,*.png  # 图片资源
├── components/       # 公共组件
│   ├── BackToTop.vue          # 返回顶部
│   ├── FpsCounter.vue         # FPS计数器
│   ├── HealthReminderOverlay  # 健康提醒遮罩
│   ├── Icon.vue              # 图标组件
│   ├── RestLockScreen.vue    # 休息锁屏
│   ├── Sidebar.vue           # 侧边栏
│   ├── ThemeColorPicker.vue  # 主题色选择器
│   ├── TimeDisplay.vue       # 时间显示
│   ├── TopNavbar.vue         # 顶部导航栏
│   └── WeatherDisplay.vue    # 天气显示
├── router/           # 路由配置
├── services/         # API服务
│   └── apiService.js # API接口封装
├── stores/           # Pinia状态管理
│   ├── activity.js         # 活动记录
│   ├── favorite.js         # 收藏管理
│   ├── healthReminder.js   # 健康提醒
│   ├── history.js         # 历史记录
│   ├── searchHistory.js   # 搜索历史
│   ├── sidebar.js         # 侧边栏状态
│   └── theme.js           # 主题设置
├── utils/            # 工具函数
│   └── meta.js      # 元数据处理
└── views/            # 页面组件
    ├── ActivityStats.vue    # 活动统计
    ├── AnimeNav.vue        # 动漫导航
    ├── ExternalVideo.vue   # 外部视频
    ├── Favorites.vue       # 收藏页面
    ├── HealthReminder.vue  # 健康提醒
    ├── History.vue         # 历史记录
    ├── HomePage.vue        # 首页
    ├── MessageBoard.vue    # 留言板
    ├── MovieNav.vue        # 电影导航
    ├── NotFound.vue        # 404页面
    ├── Search.vue          # 搜索页面
    ├── ShortsNav.vue       # 短剧导航
    ├── SouPianView.vue     # 搜片页面
    ├── TVNav.vue           # 电视剧导航
    ├── VarietyNav.vue      # 综艺导航
    ├── VideoDetail.vue     # 视频详情
    └── VideoPlay.vue       # 视频播放
```

## 🔍 使用指南

### 基础功能
- **导航栏**：顶部导航栏包含搜索框、全屏切换、主题色选择、深色/浅色模式切换等功能
- **侧边栏**：左侧侧边栏提供主要导航功能，可以折叠/展开，移动端自动折叠
- **天气显示**：支持全国城市天气显示，可以搜索和切换城市
- **时间显示**：实时显示当前时间
- **返回顶部**：滚动页面时显示返回顶部按钮

### 内容浏览
- **首页推荐**：展示最新上架和热门内容
- **分类导航**：
  - 电影：动作片、喜剧片、爱情片等分类
  - 电视剧：国产剧、港台剧、日韩剧、欧美剧等
  - 动漫：国产动漫、日本动漫、欧美动漫等
  - 综艺：各类综艺节目
  - 短剧：当下流行的短剧内容

### 搜索功能
- **快速搜索**：支持实时搜索，可在顶部搜索框输入关键词
- **搜索历史**：
  - 自动记录搜索历史
  - 点击历史记录可快速搜索
  - 支持清空搜索历史
  - 可删除单条搜索记录

### 视频播放
1. **进入播放**：
   - 点击视频封面进入详情页
   - 在详情页点击播放按钮进入播放页
   
2. **播放控制**：
   - 播放/暂停：点击视频中心或播放器控制栏
   - 进度控制：拖动进度条或点击进度条跳转
   - 音量调节：拖动音量条或点击音量图标静音
   - 播放速度：支持 0.5x 到 2x 倍速播放
   
3. **特色功能**：
   - 画中画模式：支持小窗口播放
   - 全屏播放：支持网页全屏和浏览器全屏
   - 播放源切换：多个播放源无缝切换
   - 剧集切换：连续剧可在播放页直接切换集数
   - 播放记忆：自动记住上次播放位置

### 个人中心
1. **收藏夹**：
   - 点击视频详情页的收藏按钮添加收藏
   - 在收藏页面管理收藏的视频
   - 支持取消收藏
   - 支持快速进入播放页

2. **历史记录**：
   - 自动记录观看历史
   - 显示上次观看时间和进度
   - 支持删除单条记录
   - 支持清空所有记录
   - 支持继续上次播放

3. **活动统计**：
   - 统计每日观看时长
   - 展示观看时间分布
   - 记录浏览历史
   - 提供数据可视化图表

4. **健康提醒**：
   - 自动记录连续观看时长
   - 超过设定时长自动提醒休息
   - 支持自定义提醒时间
   - 提供休息锁屏功能

### 主题设置
1. **主题色**：
   - 支持蓝色、绿色、紫色、红色、橙色等主题
   - 点击顶部导航栏的调色板图标切换
   - 主题色会应用到整个界面

2. **深色模式**：
   - 支持浅色/深色模式切换
   - 点击顶部导航栏的月亮/太阳图标切换
   - 自动适应系统主题设置

### 评论留言
- 支持在视频下方发表评论
- 基于 Twikoo 评论系统
- 支持回复他人评论
- 支持表情和图片

### 其他功能
- **页面适配**：自适应PC端和移动端布局
- **进度指示**：页面加载时显示进度条
- **错误处理**：请求失败自动重试
- **性能优化**：资源按需加载，提升访问速度

## 🔧 常见问题

### 播放相关问题

#### Q: 视频无法播放或加载很慢？
- 尝试切换不同的播放源（黑木耳、爱坤、卧龙、华为等）
- 检查网络连接是否稳定
- 清除浏览器缓存后重试
- 确认视频格式是否被当前浏览器支持

#### Q: 播放记录丢失？
- 检查浏览器是否开启了隐私模式
- 确认浏览器是否允许网站使用 localStorage
- 检查浏览器存储空间是否已满
- 尝试退出无痕浏览模式

#### Q: 画中画模式不可用？
- 确认使用的是最新版 Chrome、Firefox 或 Edge 浏览器
- 检查浏览器是否允许画中画功能
- 部分浏览器（如 Safari）可能不完全支持此功能
- 检查系统是否支持画中画模式

### 界面显示问题

#### Q: 页面显示异常？
- 尝试刷新页面
- 清除浏览器缓存和 Cookie
- 检查浏览器是否为最新版本
- 尝试切换浅色/深色模式

#### Q: 移动端适配问题？
- 确保使用最新版移动浏览器
- 检查系统缩放设置是否正常
- 尝试横屏/竖屏切换
- 部分功能在移动端可能会简化显示

#### Q: 天气信息不显示？
- 检查网络连接
- 允许浏览器获取位置信息
- 手动选择城市
- 尝试刷新页面重新加载

### 功能使用问题

#### Q: 收藏功能无法使用？
- 确认浏览器允许使用 localStorage
- 检查是否达到收藏上限
- 清理部分收藏记录后重试
- 检查浏览器存储空间是否充足

#### Q: 搜索结果不准确？
- 尝试使用不同的关键词
- 检查输入的关键词是否正确
- 尝试使用影片的准确名称
- 使用分类导航辅助查找

#### Q: 健康提醒不工作？
- 检查是否开启了健康提醒功能
- 确认浏览器通知权限是否已授权
- 检查系统是否允许网站发送通知
- 重新设置提醒时间间隔

### 性能相关问题

#### Q: 页面加载速度慢？
- 检查网络连接状态
- 清除浏览器缓存
- 关闭其他占用带宽的应用
- 尝试切换网络环境

#### Q: 视频播放卡顿？
- 降低视频清晰度
- 检查网络带宽是否足够
- 关闭其他占用资源的标签页
- 使用有线网络或 5G 网络

#### Q: 内存占用过高？
- 关闭不需要的浏览器标签
- 定期刷新页面释放内存
- 使用浏览器的任务管理器关闭无响应标签
- 检查浏览器扩展是否影响性能

### 其他问题

#### Q: 评论功能异常？
- 检查网络连接
- 确认是否登录评论系统
- 刷新页面后重试
- 评论内容不要包含敏感词

#### Q: 主题设置不生效？
- 刷新页面重试
- 清除浏览器缓存
- 检查浏览器是否支持 CSS 变量
- 重新选择主题色

#### Q: 数据统计不准确？
- 确保允许网站统计功能
- 检查系统时间是否准确
- 不要频繁切换浏览器标签
- 保持页面在前台运行

如果以上解决方案无法解决您的问题，请通过以下方式联系我们：
- 在 GitHub Issues 中提交问题
- 发送邮件至 nanshuo.icu@qq.com
- 访问 https://www.nanshuo.icu 获取帮助

## 🤝 贡献指南

我们非常欢迎社区贡献，无论是功能开发、bug修复还是文档改进。请遵循以下步骤:

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 代码风格
- 使用ESLint和Prettier保持代码风格一致
- 遵循Vue 3官方风格指南
- 组件名使用PascalCase命名法
- 提交信息遵循[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)规范

## 🔮 未来计划

### 功能增强
- [ ] 视频播放优化
  - [ ] 支持倍速播放预设
  - [ ] 自定义快捷键
  - [ ] 视频截图功能
  - [ ] 音轨切换支持

- [ ] 用户体验提升
  - [ ] 自定义播放列表
  - [ ] 批量收藏管理
  - [ ] 观看进度同步
  - [ ] 个性化推荐

- [ ] 界面优化
  - [ ] 自定义主题模板
  - [ ] 自适应布局优化
  - [ ] 更多动画效果
  - [ ] 自定义侧边栏

### 技术升级
- [ ] 性能优化
  - [ ] 首屏加载优化
  - [ ] 资源预加载
  - [ ] 组件懒加载
  - [ ] 网络请求优化

- [ ] 代码重构
  - [ ] TypeScript 重构
  - [ ] 组件库升级
  - [ ] 状态管理优化
  - [ ] API 接口重构

### 已完成功能 ✅
- [x] 播放源异步加载
- [x] 请求失败自动重试
- [x] 用户活动统计
- [x] 健康观影提醒
- [x] 主题自定义
- [x] 移动端适配优化
- [x] 播放记录本地存储
- [x] 搜索历史管理

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

**免责声明**: 本项目仅用于学习和个人使用。所有内容来源于网络公开资源，严禁将本项目用于任何商业用途。如有侵权，请联系我们删除。

## 📬 联系方式

如有任何问题或建议，欢迎通过以下方式联系我们:
- 📧 邮箱: [nanshuo.icu@qq.com]
- 💬 GitHub Issues: [https://github.com/nanshuo0814/ssng_tv_free_online_viewing/issues]
- 🌐 个人网站: [https://www.nanshuo.icu]

## 🙏 致谢

感谢以下开源项目为本项目提供的强大支持：

### 核心框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集

### UI 组件
- [Element Plus](https://element-plus.org/) - 基于 Vue 3 的组件库
- [Element Plus Icons](https://element-plus.org/zh-CN/component/icon.html) - Element Plus 图标库

### 视频播放
- [Artplayer](https://artplayer.org/) - 现代化的视频播放器
- [HLS.js](https://github.com/video-dev/hls.js/) - HLS 流媒体播放解决方案

### 状态管理
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理框架
- [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate) - Pinia 持久化插件

### 路由管理
- [Vue Router](https://router.vuejs.org/) - Vue.js 官方路由

### 工具库
- [VueUse](https://vueuse.org/) - Vue Composition API 工具集
- [Axios](https://axios-http.com/) - 基于 Promise 的 HTTP 客户端
- [ECharts](https://echarts.apache.org/) - 可视化图表库
- [html2canvas](https://html2canvas.hertzen.com/) - 网页截图工具
- [qrcode.vue](https://github.com/scopewu/qrcode.vue) - 二维码生成组件
- [NProgress](https://ricostacruz.com/nprogress/) - 进度条组件

### 开发工具
- [ESLint](https://eslint.org/) - JavaScript 代码检查工具
- [Prettier](https://prettier.io/) - 代码格式化工具
- [npm](https://www.npmjs.com/) - 包管理工具

### 评论系统
- [Twikoo](https://twikoo.js.org/) - 一个简洁、安全的评论系统

### 数据存储
- [MongoDB](https://www.mongodb.com/) - 开源的NoSQL数据库

### 部署平台
- [Vercel](https://vercel.com/) - 现代化的网站托管平台

### 特别感谢
- 感谢所有为本项目提供反馈和建议的用户
- 感谢所有为本项目做出贡献的开发者
- 感谢 GitHub 提供的开源平台

---

<div align="center">
  <p>⭐ 如果您喜欢这个项目，请给我们一个星星! ⭐</p>
  <p>Made with ❤️ by <a href="https://github.com/nanshuo0814">nanshuo0814</a></p>
</div>
