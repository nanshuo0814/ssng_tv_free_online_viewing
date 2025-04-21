/**
 * 保存当前导航状态到localStorage
 * @param {string} path - 当前路径
 */
export function saveCurrentNavigationState(path) {
  try {
    // 移除哈希标志，只保存路径部分
    const cleanPath = path.replace(/^#/, '');
    localStorage.setItem('last-navigation-path', cleanPath);
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
    const path = localStorage.getItem('last-navigation-path');
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
    localStorage.removeItem('last-navigation-path');
  } catch (error) {
    console.error('无法清除导航状态', error);
  }
} 