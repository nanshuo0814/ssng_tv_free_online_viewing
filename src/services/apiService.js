import axios from 'axios';

/**
 * Fetch video details by ID
 * @param {string|number} id - The video ID
 * @returns {Promise<Object>} - The API response data
 */
export async function getVideoDetail(id) {
  try {
    const response = await axios.get(`/api/api.php/provide/vod/`, {
      params: {
        ac: 'detail',
        ids: id
      }
    });
    return response.data;
  } catch (error) {
    console.error('API error when fetching video details:', error);
    throw error;
  }
}

/**
 * Search videos by keyword
 * @param {string} keyword - The search keyword 
 * @param {string} apiEndpoint - Optional API endpoint, defaults to '/api'
 * @returns {Promise<Object>} - The API response data
 */
export async function searchVideos(keyword, apiEndpoint = '/api') {
  try {
    const response = await axios.get(`${apiEndpoint}/api.php/provide/vod/`, {
      params: {
        ac: 'list',
        wd: keyword
      }
    }).catch(error => {
      // If search fails with custom endpoint, try default API
      if (apiEndpoint !== '/api') {
        console.log('Fallback to default API for search');
        return axios.get(`/api/api.php/provide/vod/`, {
          params: {
            ac: 'list',
            wd: keyword
          }
        });
      }
      throw error;
    });
    
    return response.data;
  } catch (error) {
    console.error('API error when searching videos:', error);
    throw error;
  }
} 