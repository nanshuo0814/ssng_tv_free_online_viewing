import { createRouter, createWebHashHistory } from 'vue-router'
import { saveCurrentNavigationState, getLastNavigationState } from '@/utils/meta'
import HomePage from '../views/HomePage.vue'
import MovieNav from '../views/MovieNav.vue'
import AnimeNav from '../views/AnimeNav.vue'
import VarietyNav from '../views/VarietyNav.vue'
import HealthReminder from '../views/HealthReminder.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'SSNG TV - 在线影视网站'
    }
  },
  {
    path: '/tv',
    name: 'TV',
    component: () => import('@/views/TVNav.vue'),
    props: { type: 'tv' },
    meta: {
      title: '电视剧 - 在线影视网站'
    }
  },
  {
    path: '/movies',
    name: 'Movies',
    component: MovieNav,
    meta: {
      title: '电影 - 在线影视网站'
    }
  },
  {
    path: '/anime',
    name: 'Anime',
    component: AnimeNav,
    meta: {
      title: '动漫 - 在线影视网站'
    }
  },
  {
    path: '/shorts',
    name: 'Shorts',
    component: () => import('@/views/ShortsNav.vue'),
    props: { type: 'shorts' },
    meta: {
      title: '短剧 - 在线影视网站'
    }
  },
  {
    path: '/variety',
    name: 'Variety',
    component: VarietyNav,
    meta: {
      title: '综艺 - 在线影视网站'
    }
  },
  {
    path: '/external-video',
    name: 'ExternalVideo',
    component: () => import('@/views/ExternalVideo.vue'),
    meta: {
      title: '凌云影视 - 在线影视网站'
    }
  },
  {
    path: '/message-board',
    name: 'MessageBoard',
    component: () => import('@/views/MessageBoard.vue'),
    meta: {
      title: '评论留言 - 在线影视网站'
    }
  },
  {
    path: '/soupian',
    name: 'SouPian',
    component: () => import('@/views/SouPianView.vue'),
    meta: {
      title: '搜片.com - 在线影视网站'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: {
      title: '搜索 - 在线影视网站'
    }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue'),
    meta: {
      title: '我的收藏 - 在线影视网站'
    }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
    meta: {
      title: '观看历史 - 在线影视网站'
    }
  },
  {
    path: '/video/detail/:id',
    name: 'videoDetailNew',
    component: () => import('@/views/VideoDetail.vue'),
    props: true,
    meta: {
      title: '影片详情 - 在线影视网站'
    }
  },
  {
    path: '/play/:id/:episode/:source',
    name: 'VideoPlay',
    component: () => import('../views/VideoPlay.vue'),
    props: true,
    meta: {
      title: '正在播放 - 在线影视网站'
    }
  },
  {
    path: '/activity',
    name: 'Activity',
    component: () => import('../views/ActivityStats.vue'),
    meta: {
      title: '活动记录 - 在线影视网站'
    }
  },
  {
    path: '/health-reminder',
    name: 'health-reminder',
    component: HealthReminder,
    meta: {
      title: '健康提醒',
      icon: 'Bell'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404 - 页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局导航守卫，用于更新页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || 'SSNG TV - 在线影视网站'
  next()
})

// 导航守卫，保存当前路径
router.afterEach((to) => {
  // 每次导航完成后保存路径（包括首页）
  saveCurrentNavigationState(to.path);
})

// 导航守卫，在初始化时检查是否有保存的路径
let isFirstNavigation = true;
router.beforeEach((to, from, next) => {
  // 检查是否为首次加载且是重定向到首页的情况
  if (isFirstNavigation && to.path === '/' && to.redirectedFrom === undefined) {
    // 正常重定向到首页
    isFirstNavigation = false;
    next();
    return;
  }
  
  // 如果用户明确访问的是首页(已保存的路径也是首页)，或者明确刷新了首页，则不跳转
  const lastPath = getLastNavigationState();
  if (to.path === '/home' || lastPath === '/home') {
    isFirstNavigation = false;
    next();
    return;
  }
  
  // 其他情况，如果有保存的路径且不是首页，则跳转
  if (isFirstNavigation && (to.path === '/' || to.path === '/home')) {
    if (lastPath && lastPath !== '/' && lastPath !== '/home') {
      isFirstNavigation = false;
      next({ path: lastPath, replace: true });
      return;
    }
  }
  
  isFirstNavigation = false;
  next();
})

export default router 