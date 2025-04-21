import axios from 'axios';

// 默认资源站URL
const DEFAULT_API_URL = 'https://heimuer.tv';

// 用于存储当前选中的资源站
let currentApiUrl = DEFAULT_API_URL;

/**
 * 设置当前使用的资源站URL
 * @param {string} url 资源站URL
 */
export function setApiUrl(url) {
  currentApiUrl = url;
}

/**
 * 获取当前使用的资源站URL
 * @returns {string} 当前资源站URL
 */
export function getApiUrl() {
  return currentApiUrl;
}

/**
 * 创建标准MacCMS10 API URL
 * @param {string} action 动作类型 list/detail/videolist等
 * @param {Object} params 其他参数
 * @returns {string} 完整API URL
 */
function createApiUrl(action, params = {}) {
  const url = new URL(`${currentApiUrl}/api.php/provide/vod/`);
  
  // 添加动作参数
  url.searchParams.append('ac', action);
  
  // 添加其他参数
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  return url.toString();
}

/**
 * 获取视频列表数据
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @param {number} typeId 分类ID
 * @param {string} keyword 搜索关键词
 * @returns {Promise} 视频列表数据
 */
export async function getVideoList(page = 1, pageSize = 20, typeId = 0, keyword = '') {
  const params = {
    pg: page,
    pagesize: pageSize,
  };
  
  // 如果有分类ID
  if (typeId && typeId > 0) {
    params.t = typeId;
  }
  
  // 如果有搜索关键词
  if (keyword) {
    params.wd = keyword;
  }
  
  try {
    const response = await axios.get(createApiUrl('list', params));
    return response.data;
  } catch (error) {
    console.error('获取视频列表失败', error);
    throw error;
  }
}

/**
 * 获取视频详情数据
 * @param {number|string} id 视频ID
 * @returns {Promise} 视频详情数据
 */
export async function getVideoDetail(id) {
  try {
    const response = await axios.get(createApiUrl('detail', { ids: id }));
    return response.data;
  } catch (error) {
    console.error('获取视频详情失败', error);
    throw error;
  }
}

/**
 * 获取分类列表
 * @returns {Promise} 分类列表数据
 */
export async function getCategories() {
  try {
    // 获取分类列表，通常是请求只有1个item的列表，然后从结果中提取所有分类信息
    const response = await axios.get(createApiUrl('list', { pagesize: 1 }));
    
    // 提取分类信息并去重
    if (response.data && response.data.list && response.data.list.length > 0) {
      const categoryMap = new Map();
      
      response.data.list.forEach(item => {
        if (item.type_id && item.type_name) {
          categoryMap.set(item.type_id, item.type_name);
        }
      });
      
      // 转换成数组格式返回
      return Array.from(categoryMap).map(([id, name]) => ({ id, name }));
    }
    
    return [];
  } catch (error) {
    console.error('获取分类列表失败', error);
    throw error;
  }
}

/**
 * 获取最近更新的视频
 * @param {number} hours 小时数
 * @param {number} pageSize 每页数量
 * @returns {Promise} 最近更新的视频列表
 */
export async function getRecentVideos(hours = 24, pageSize = 20) {
  try {
    const response = await axios.get(createApiUrl('list', { h: hours, pagesize: pageSize }));
    return response.data;
  } catch (error) {
    console.error('获取最近视频失败', error);
    throw error;
  }
}

/**
 * 搜索视频
 * @param {string} keyword 搜索关键词
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @returns {Promise} 搜索结果
 */
export async function searchVideos(keyword, page = 1, pageSize = 20) {
  try {
    const response = await axios.get(createApiUrl('list', { wd: keyword, pg: page, pagesize: pageSize }));
    return response.data;
  } catch (error) {
    console.error('搜索视频失败', error);
    throw error;
  }
}

export default {
  getVideoList,
  getVideoDetail,
  getCategories,
  getRecentVideos,
  searchVideos,
  setApiUrl,
  getApiUrl
}; 