import { createRouter, createWebHashHistory } from 'vue-router'
import { saveCurrentNavigationState, getLastNavigationState } from '@/utils/meta'
import HomePage from '../views/HomePage.vue'
import Play from '../views/Play.vue'
import MovieNav from '../views/MovieNav.vue'
import DramaNav from '../views/DramaNav.vue'
import AnimeNav from '../views/AnimeNav.vue'
import VarietyNav from '../views/VarietyNav.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/tv',
    name: 'TV',
    component: () => import('@/views/Category.vue'),
    props: { type: 'tv' }
  },
  {
    path: '/movies',
    name: 'Movies',
    component: MovieNav
  },
  {
    path: '/anime',
    name: 'Anime',
    component: AnimeNav
  },
  {
    path: '/shorts',
    name: 'Shorts',
    component: () => import('@/views/Category.vue'),
    props: { type: 'shorts' }
  },
  {
    path: '/variety',
    name: 'Variety',
    component: VarietyNav
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: () => import('@/views/MovieDetail.vue'),
    props: true
  },
  {
    path: '/tv/:id',
    name: 'TVDetail',
    component: () => import('@/views/MovieDetail.vue'),
    props: true
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue')
  },
  {
    path: '/:mediaType/:id/play',
    name: 'Play',
    component: Play,
    props: true
  },
  {
    path: '/category/:type',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
    props: true
  },
  // 资源站视频详情路由（保留但不在导航中显示）
  {
    path: '/video/:id',
    name: 'videoDetail',
    component: () => import('@/views/ApiVideoDetail.vue'),
    props: true
  },
  {
    path: '/dramas',
    name: 'dramas',
    component: DramaNav
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
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