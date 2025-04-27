# 烁烁南光在线免费影视

[![GitHub stars](https://img.shields.io/github/stars/nanshuo0814/ssng_tv_free_online_viewing?style=social)](https://github.com/nanshuo0814/ssng_tv_free_online_viewing)
[![GitHub forks](https://img.shields.io/github/forks/nanshuo0814/ssng_tv_free_online_viewing?style=social)](https://github.com/nanshuo0814/ssng_tv_free_online_viewing)
[![GitHub last commit](https://img.shields.io/github/last-commit/nanshuo0814/ssng_tv_free_online_viewing)](https://github.com/nanshuo0814/ssng_tv_free_online_viewing)
[![GitHub issues](https://img.shields.io/github/issues/nanshuo0814/ssng_tv_free_online_viewing)](https://github.com/nanshuo0814/ssng_tv_free_online_viewing/issues)

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

- **前端框架**: Vue 3 (Composition API) + TypeScript
- **构建工具**: Vite 4
- **UI 组件库**: Element Plus 2.3
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP 请求**: Axios
- **视频播放**: Artplayer + HLS.js
- **CSS 预处理**: SCSS
- **工具库**: VueUse, Dayjs, Lodash
- **字体图标**: Element-Plus Icons

## ✨ 功能特点

### 🎬 视频播放功能
- **多源切换**: 支持黑木耳、爱坤、卧龙、360等多个播放源，无缝切换
- **智能解析**: 自动识别视频格式并选择最佳播放方式
- **高级播放器**: 画中画、全屏播放、倍速调节
- **播放记忆**: 自动记住上次播放位置，跨设备续播
- **弹幕系统**: 观影互动更有趣（开发中）

### 🎨 用户界面
- **自适应布局**: 完美支持PC、平板、手机等多种设备，UI自动适配
- **深色/浅色模式**: 智能切换，保护视力
- **自定义主题**: 个性化界面色彩
- **流畅动画**: 页面过渡和交互动画

### 📱 用户体验
- **快速搜索**: 支持模糊搜索、热门推荐
- **分类浏览**: 多维度内容分类，轻松找到感兴趣的内容
- **个人中心**: 收藏夹、历史记录、系统设置
- **站内通知**: 更新提醒、系统公告（开发中）

### 🔧 系统性能
- **延迟加载**: 优化首屏加载速度
- **资源预加载**: 智能预测用户行为，提前加载资源
- **缓存策略**: 合理利用浏览器缓存，减少网络请求
- **性能监控**: 内置性能监控工具，实时展示FPS

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

## 📂 项目结构

```
src/
├── api/              # API接口定义
├── assets/           # 静态资源
│   ├── fonts/        # 字体文件
│   ├── images/       # 图片资源
│   └── styles/       # 全局样式
├── components/       # 公共组件
│   ├── common/       # 通用组件
│   ├── layout/       # 布局组件
│   └── player/       # 播放器相关组件
├── composables/      # 组合式API
├── config/           # 配置文件
├── directives/       # 自定义指令
├── router/           # 路由配置
├── stores/           # Pinia状态管理
├── utils/            # 工具函数
│   ├── http/         # 网络请求
│   ├── storage/      # 本地存储
│   └── helpers/      # 辅助函数
└── views/            # 页面组件
    ├── home/         # 首页
    ├── detail/       # 详情页
    ├── play/         # 播放页
    ├── search/       # 搜索页
    └── user/         # 用户中心
```

## 🔍 使用指南

### 首页浏览
首页展示热门推荐、最新上架和编辑精选内容。可以点击顶部导航切换不同内容分类，或使用搜索功能查找特定影片。

### 视频播放
1. 点击任意影片海报进入详情页
2. 在详情页点击"立即播放"进入播放页
3. 播放页支持以下操作:
   - 切换播放源 (右上角下拉菜单)
   - 选择剧集 (底部剧集列表)
   - 调整播放速度 (右键菜单)
   - 开启/关闭画中画模式 (右键菜单或快捷键Alt+P)
   - 全屏/退出全屏 (播放器右下角按钮或F键)

### 个人中心
- **收藏夹**: 收藏喜欢的影片，方便后续观看
- **历史记录**: 查看最近观看的内容，支持继续播放和删除记录
- **系统设置**: 调整主题色、切换深色/浅色模式

## 🛠️ 进阶配置

### 自定义API接口
可以修改`src/config/api.js`文件来配置不同的API接口地址:

```js
// 默认配置
const API_CONFIG = {
  baseURL: '/api',
  timeout: 10000,
  // 其他配置...
}

// 根据环境变量使用不同配置
if (import.meta.env.PROD) {
  API_CONFIG.baseURL = 'https://api.example.com'
}

export default API_CONFIG
```

### 开发自定义组件
如需开发自定义组件，请遵循项目的组件开发规范:

1. 在`src/components`目录下创建新组件
2. 使用Composition API编写组件逻辑
3. 添加适当的TypeScript类型定义
4. 编写组件文档注释
5. 如需添加样式，使用scoped CSS确保样式不会污染全局

## 🔧 常见问题

### 播放器相关问题

#### Q: 为什么视频无法播放或加载很慢?
- 检查网络连接是否稳定
- 尝试切换不同的播放源
- 检查浏览器是否支持当前视频格式
- 清除浏览器缓存后重试

#### Q: 画中画模式在某些浏览器无法使用
- 确保使用最新版Chrome、Firefox或Edge浏览器
- 某些浏览器(如Safari)可能限制画中画功能
- 检查浏览器设置中是否启用了画中画功能

#### Q: 跳转页面后画中画窗口仍然存在但无法播放
- 这是已知问题，已在最新版本修复
- 解决方案：在跳转前手动关闭画中画窗口，或升级到最新版本

### 系统相关问题

#### Q: 网站在手机上显示异常
- 确保使用最新版移动浏览器
- 尝试刷新页面或清除浏览器缓存
- 某些低端设备可能不支持所有功能，建议使用主流设备

#### Q: 收藏/历史记录无法保存
- 浏览器可能禁用了localStorage，请检查浏览器设置
- 尝试退出无痕/隐私模式浏览
- 确保未禁用Cookie和本地存储

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

- [ ] 弹幕系统
- [ ] 用户评分与评论
- [ ] 多语言支持
- [ ] 离线缓存功能
- [ ] 更多自定义选项
- [ ] 移动应用开发

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

**免责声明**: 本项目仅用于学习和个人使用。所有内容来源于网络公开资源，严禁将本项目用于任何商业用途。如有侵权，请联系我们删除。

## 📬 联系方式

如有任何问题或建议，欢迎通过以下方式联系我们:
- 📧 邮箱: [nanshuo.icu@qq.com]
- 💬 GitHub Issues: [https://github.com/nanshuo0814/ssng_tv_free_online_viewing/issues]
- 🌐 个人网站: [https://www.nanshuo.icu]

## 🙏 致谢

感谢所有为本项目做出贡献的开发者以及以下开源项目:

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Artplayer](https://artplayer.org/)
- [HLS.js](https://github.com/video-dev/hls.js/)
- [Pinia](https://pinia.vuejs.org/)
- [VueUse](https://vueuse.org/)

---

<div align="center">
  <p>⭐ 如果您喜欢这个项目，请给我们一个星星! ⭐</p>
  <p>Made with ❤️ by <a href="https://github.com/nanshuo0814">nanshuo0814</a></p>
</div>
