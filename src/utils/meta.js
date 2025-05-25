/**
 * 用于保存和获取导航状态的工具函数
 */

const NAVIGATION_STATE_KEY = 'last-navigation-path';

/**
 * 保存当前导航状态到localStorage
 * @param {string} path - 当前路径
 */
export function saveCurrentNavigationState(path) {
  try {
    // 移除哈希标志，只保存路径部分
    const cleanPath = path.replace(/^#/, '');
    localStorage.setItem(NAVIGATION_STATE_KEY, cleanPath);
  } catch (error) {
    console.error('无法保存导航状态', error);
  }
}

/**
 * 获取上次保存的导航状态
 * @returns {string|null} - 保存的路径或null
 */
export function getLastNavigationState() {
  try {
    const path = localStorage.getItem(NAVIGATION_STATE_KEY);
    return path;
  } catch (error) {
    console.error('无法获取导航状态', error);
    return null;
  }
}

/**
 * 清除导航状态
 */
export function clearNavigationState() {
  try {
    localStorage.removeItem(NAVIGATION_STATE_KEY);
  } catch (error) {
    console.error('无法清除导航状态', error);
  }
} 