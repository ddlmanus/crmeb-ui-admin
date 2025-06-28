<template>
  <div class="sync-test-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>商品分类同步测试</span>
      </div>
      <div class="test-content">
        <p>这是一个独立的测试组件，用于验证商品分类同步功能。</p>
        
        <el-button 
          type="success" 
          size="small"
          :loading="syncLoading"
          @click="handleSync"
          style="margin: 10px 0;"
        >
          <i class="el-icon-refresh"></i>
          {{ syncLoading ? '同步中...' : '同步商品分类' }}
        </el-button>

        <div v-if="syncResult" class="sync-result">
          <h4>同步结果：</h4>
          <pre>{{ JSON.stringify(syncResult, null, 2) }}</pre>
        </div>

        <div v-if="syncError" class="sync-error">
          <h4>错误信息：</h4>
          <p style="color: red;">{{ syncError }}</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { productCategorySyncApi } from '@/api/product'

export default {
  name: 'SyncTest',
  data() {
    return {
      syncLoading: false,
      syncResult: null,
      syncError: null
    }
  },
  methods: {
    handleSync() {
      this.syncLoading = true
      this.syncResult = null
      this.syncError = null
      
      // 调用同步API
      productCategorySyncApi()
        .then((response) => {
          console.log('同步成功:', response)
          this.syncResult = response
          this.$message.success('同步成功！')
        })
        .catch((error) => {
          console.error('同步失败:', error)
          this.syncError = error.message || '同步失败'
          this.$message.error('同步失败: ' + this.syncError)
        })
        .finally(() => {
          this.syncLoading = false
        })
    }
  }
}
</script>

<style scoped>
.sync-test-container {
  padding: 20px;
}

.test-content {
  padding: 20px 0;
}

.sync-result {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
}

.sync-error {
  margin-top: 20px;
  padding: 10px;
  background-color: #fef0f0;
  border: 1px solid #fbb0b0;
  border-radius: 4px;
}

pre {
  max-height: 200px;
  overflow-y: auto;
}
</style> 