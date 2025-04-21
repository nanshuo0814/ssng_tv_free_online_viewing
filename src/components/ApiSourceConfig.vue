<template>
  <div class="api-source-config">
    <el-dialog
      v-model="dialogVisible"
      title="资源站配置"
      width="500px"
    >
      <div class="source-form">
        <el-form :model="form" label-width="120px">
          <el-form-item label="当前资源站">
            <el-select
              v-model="currentSourceIndex"
              placeholder="选择资源站"
              style="width: 100%"
              @change="handleSourceChange"
            >
              <el-option
                v-for="(source, index) in apiSources"
                :key="index"
                :label="source.name"
                :value="index"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="资源站名称">
            <el-input v-model="form.name" placeholder="输入资源站名称" />
          </el-form-item>
          
          <el-form-item label="资源站URL">
            <el-input v-model="form.url" placeholder="输入资源站URL（如https://example.com）" />
          </el-form-item>
        </el-form>
        
        <div class="api-sources-list">
          <h4>已保存的资源站</h4>
          <el-table :data="apiSources" style="width: 100%" max-height="250">
            <el-table-column prop="name" label="名称" width="120" />
            <el-table-column prop="url" label="URL" />
            <el-table-column fixed="right" label="操作" width="100">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="setAsActive(scope.$index)"
                >
                  使用
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="removeSource(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSource">
            保存资源站
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <el-button
      type="primary"
      size="small"
      @click="showDialog"
      class="settings-button"
    >
      资源站设置
    </el-button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { setApiUrl, getApiUrl } from '../services/apiService';

// 对话框可见性
const dialogVisible = ref(false);

// 表单数据
const form = reactive({
  name: '',
  url: ''
});

// 资源站列表
const apiSources = ref([
  { name: 'heimuer', url: 'https://heimuer.tv' }
]);

// 当前选中的资源站索引
const currentSourceIndex = ref(0);

// 显示对话框
function showDialog() {
  dialogVisible.value = true;
}

// 保存资源站
function saveSource() {
  if (!form.name || !form.url) {
    ElMessage.warning('请填写资源站名称和URL');
    return;
  }
  
  // 检查URL格式
  try {
    new URL(form.url);
  } catch (e) {
    ElMessage.error('请输入有效的URL，包含http://或https://');
    return;
  }
  
  // 添加到列表
  apiSources.value.push({
    name: form.name,
    url: form.url
  });
  
  // 保存到本地存储
  saveApiSourcesToStorage();
  
  // 清空表单
  form.name = '';
  form.url = '';
  
  ElMessage.success('资源站保存成功');
}

// 移除资源站
function removeSource(index) {
  if (apiSources.value.length <= 1) {
    ElMessage.warning('至少保留一个资源站');
    return;
  }
  
  // 如果删除的是当前选中的
  if (index === currentSourceIndex.value) {
    // 设置为第一个
    currentSourceIndex.value = 0;
    setApiUrl(apiSources.value[0].url);
  } else if (index < currentSourceIndex.value) {
    // 如果删除的索引小于当前索引，当前索引减1
    currentSourceIndex.value--;
  }
  
  // 从列表中移除
  apiSources.value.splice(index, 1);
  
  // 保存到本地存储
  saveApiSourcesToStorage();
  
  ElMessage.success('资源站已删除');
}

// 设置为活动资源站
function setAsActive(index) {
  currentSourceIndex.value = index;
  setApiUrl(apiSources.value[index].url);
  saveCurrentSourceToStorage();
  ElMessage.success(`已切换到资源站: ${apiSources.value[index].name}`);
}

// 处理资源站变更
function handleSourceChange(index) {
  setAsActive(index);
}

// 从本地存储加载资源站列表
function loadApiSourcesFromStorage() {
  const sourcesJson = localStorage.getItem('apiSources');
  if (sourcesJson) {
    try {
      const sources = JSON.parse(sourcesJson);
      if (Array.isArray(sources) && sources.length > 0) {
        apiSources.value = sources;
      }
    } catch (e) {
      console.error('加载资源站列表失败', e);
    }
  }
  
  // 加载当前选中的资源站
  const currentSourceIndexStr = localStorage.getItem('currentSourceIndex');
  if (currentSourceIndexStr) {
    const index = parseInt(currentSourceIndexStr);
    if (!isNaN(index) && index >= 0 && index < apiSources.value.length) {
      currentSourceIndex.value = index;
      setApiUrl(apiSources.value[index].url);
    }
  }
}

// 保存资源站列表到本地存储
function saveApiSourcesToStorage() {
  localStorage.setItem('apiSources', JSON.stringify(apiSources.value));
}

// 保存当前选中的资源站索引
function saveCurrentSourceToStorage() {
  localStorage.setItem('currentSourceIndex', currentSourceIndex.value.toString());
}

// 组件挂载时加载资源站列表
onMounted(() => {
  loadApiSourcesFromStorage();
});
</script>

<style scoped>
.api-source-config {
  margin-bottom: 20px;
}

.source-form {
  margin-bottom: 20px;
}

.api-sources-list {
  margin-top: 20px;
}

.settings-button {
  margin-bottom: 15px;
}
</style> 