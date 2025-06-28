<template>
  <div class="asset-assessment-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button 
          type="text" 
          icon="el-icon-arrow-left" 
          @click="handleClose"
          class="back-btn"
        >
          返回列表
        </el-button>
        <div class="page-title">
          <h2>资产评估详情</h2>
          <p class="subtitle">评估ID: {{ assessmentInfo ? assessmentInfo.id : '-' }}</p>
        </div>
      </div>
      <div class="header-right">
        <el-tag 
          :type="(assessmentInfo && assessmentInfo.assessmentStatus === 1) ? 'success' : 'warning'" 
          size="large"
          class="status-tag"
        >
          <i :class="(assessmentInfo && assessmentInfo.assessmentStatus === 1) ? 'el-icon-check' : 'el-icon-edit'"></i>
          {{ (assessmentInfo && assessmentInfo.assessmentStatus === 1) ? '已提交' : '草稿' }}
        </el-tag>
        <el-tag 
          :type="(assessmentInfo && assessmentInfo.isUsed === 1) ? 'danger' : 'success'" 
          size="large"
          class="status-tag"
        >
          <i :class="(assessmentInfo && assessmentInfo.isUsed === 1) ? 'el-icon-lock' : 'el-icon-unlock'"></i>
          {{ (assessmentInfo && assessmentInfo.isUsed === 1) ? '已使用' : '未使用' }}
        </el-tag>
      </div>
    </div>

    <!-- 核心统计卡片 -->
    <div class="stats-grid" v-loading="loading">
      <div class="stat-card primary">
        <div class="stat-icon">
          <i class="el-icon-collection-tag"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalBreeds }}</h3>
          <p>养殖品种数</p>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">
          <i class="el-icon-data-line"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(totalStock) }}</h3>
          <p>总存栏量</p>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">
          <i class="el-icon-coin"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatCurrency(totalAssessmentValue) }}</h3>
          <p>总评估价值</p>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">
          <i class="el-icon-price-tag"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatCurrency(averagePrice) }}</h3>
          <p>平均单价</p>
        </div>
      </div>
    </div>

    <!-- 基本信息卡片 -->
    <el-card class="info-card" shadow="hover" v-loading="loading">
      <div slot="header" class="card-header">
        <div class="card-title">
          <i class="el-icon-user"></i>
          基本信息
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-user-solid"></i>
            用户信息
          </div>
          <div class="info-value">
            {{ assessmentInfo ? `${assessmentInfo.userName || '-'} (ID: ${assessmentInfo.userId || '-'})` : '-' }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-s-flag"></i>
            评估对象
          </div>
          <div class="info-value">
            <el-tag :type="getAssessmentTypeTagType(assessmentInfo ? assessmentInfo.assessmentType : null)">
              {{ getAssessmentTypeText(assessmentInfo ? assessmentInfo.assessmentType : null) }}
            </el-tag>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-office-building"></i>
            养殖场名称
          </div>
          <div class="info-value">
            {{ assessmentInfo ? assessmentInfo.farmName : '-' }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-link"></i>
            养殖场机构ID
          </div>
          <div class="info-value">
            {{ assessmentInfo ? assessmentInfo.farmInstitutionId : '-' }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-user"></i>
            负责人姓名
          </div>
          <div class="info-value">
            {{ assessmentInfo ? assessmentInfo.managerName : '-' }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-phone"></i>
            负责人电话
          </div>
          <div class="info-value">
            {{ assessmentInfo ? assessmentInfo.managerPhone : '-' }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-postcard"></i>
            身份证号/信用代码
          </div>
          <div class="info-value">
            {{ assessmentInfo ? assessmentInfo.idNumber : '-' }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-time"></i>
            创建时间
          </div>
          <div class="info-value">
            {{ formatDateTime(assessmentInfo ? assessmentInfo.createTime : null) }}
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">
            <i class="el-icon-refresh"></i>
            更新时间
          </div>
          <div class="info-value">
            {{ formatDateTime(assessmentInfo ? assessmentInfo.updateTime : null) }}
          </div>
        </div>
      </div>
      
      <div v-if="assessmentInfo && assessmentInfo.remark" class="remark-section">
        <div class="info-label">
          <i class="el-icon-document"></i>
          备注信息
        </div>
        <div class="remark-content">
          {{ assessmentInfo.remark }}
        </div>
      </div>
    </el-card>

    <!-- 养殖品种信息卡片 -->
    <el-card class="breeding-card" shadow="hover" v-loading="loading">
      <div slot="header" class="card-header">
        <div class="card-title">
          <i class="el-icon-menu"></i>
          养殖品种详情
        </div>
        <div class="card-extra">
          <el-tag type="info" size="small">共 {{ breedingList.length }} 个品种</el-tag>
        </div>
      </div>
      
      <div class="table-container">
        <el-table
          :data="breedingList"
          stripe
          border
          size="medium"
          style="width: 100%"
          class="breeding-table"
          empty-text="暂无养殖品种数据"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          
          <el-table-column prop="farmName" label="养殖场" min-width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              <div class="farm-info">
                <div class="farm-name">{{ scope.row.farmName }}</div>
                <div class="farm-code">{{ scope.row.farmCode }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="品种信息" min-width="150">
            <template slot-scope="scope">
              <div class="breed-info">
                <div class="breed-name">
                  <el-tag size="mini" type="primary">{{ scope.row.breedName }}</el-tag>
                </div>
                <div class="breed-type">{{ scope.row.breedType }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="存栏信息" width="120" align="center">
            <template slot-scope="scope">
              <div class="stock-info">
                <div class="stock-quantity">{{ formatNumber(scope.row.stockQuantity) }}</div>
                <div class="stock-unit">{{ scope.row.assessmentUnit || '头' }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="评估单价" width="120" align="right">
            <template slot-scope="scope">
              <div class="price-info">
                <div class="price-value">{{ formatCurrency(scope.row.assessmentPrice) }}</div>
                <div class="price-unit">/ {{ scope.row.assessmentUnit || '头' }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="评估总价" width="140" align="right">
            <template slot-scope="scope">
              <div class="total-price">
                {{ formatCurrency(scope.row.assessmentTotalPrice) }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="授信系数" width="100" align="center">
            <template slot-scope="scope">
              <el-progress 
                :percentage="Number(scope.row.creditCoefficient || 0) * 100" 
                :color="getProgressColor(Number(scope.row.creditCoefficient || 0) * 100)"
                :show-text="false"
                :stroke-width="8"
              ></el-progress>
              <div class="coefficient-text">{{ formatPercent(scope.row.creditCoefficient) }}</div>
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="创建时间" width="160" align="center">
            <template slot-scope="scope">
              <div class="time-info">
                <div class="date">{{ formatDate(scope.row.createTime) }}</div>
                <div class="time">{{ formatTime(scope.row.createTime) }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button size="large" @click="handleClose">关闭详情</el-button>
    </div>
  </div>
</template>

<script>
import { getAssetAssessmentInfo } from '@/api/assetAssessment'
import { getByAssessmentId } from '@/api/assetAssessmentBreeding'

export default {
  name: 'AssetAssessmentDetail',
  props: {
    assessmentId: {
      type: String,
      default: null
    }
  },
  computed: {
    currentAssessmentId() {
      return this.assessmentId || this.$route.params.id
    },
    totalBreeds() {
      return this.breedingList.length
    },
    totalStock() {
      return this.breedingList.reduce((total, item) => total + (item.stockQuantity || 0), 0)
    },
    totalAssessmentValue() {
      return this.breedingList.reduce((total, item) => total + (parseFloat(item.assessmentTotalPrice) || 0), 0)
    },
    averagePrice() {
      if (this.totalStock === 0) return 0
      return this.totalAssessmentValue / this.totalStock
    }
  },
  watch: {
    currentAssessmentId(newId, oldId) {
      if (newId && newId !== oldId) {
        this.fetchData()
      }
    }
  },
  data() {
    return {
      loading: false,
      assessmentInfo: {},
      breedingList: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      if (!this.currentAssessmentId) {
        console.warn('评估ID缺失，无法加载数据')
        return
      }
      this.loading = true
      try {
        console.log('开始获取资产评估详情，ID:', this.currentAssessmentId)
        
        // 获取评估基本信息
        const assessmentResponse = await getAssetAssessmentInfo(this.currentAssessmentId)
        console.log('评估基本信息响应:', assessmentResponse)
        
        // 响应拦截器可能已经处理了 data 层级
        this.assessmentInfo = assessmentResponse || {}
        console.log('处理后的评估信息:', this.assessmentInfo)

        // 获取品种信息
        const breedingResponse = await getByAssessmentId(this.currentAssessmentId)
        console.log('品种信息响应:', breedingResponse)
        
        this.breedingList = breedingResponse || []
        console.log('处理后的品种信息:', this.breedingList)
      } catch (error) {
        console.error('获取资产评估详情失败:', error)
        this.$message.error('获取数据失败：' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      this.$emit('close')
    },
    formatDateTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    formatDate(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleDateString('zh-CN')
    },
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleTimeString('zh-CN', { hour12: false })
    },
    formatNumber(num) {
      return num ? num.toLocaleString() : '0'
    },
    formatCurrency(amount) {
      if (!amount && amount !== 0) return '¥0.00'
      return `¥${Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    formatPercent(value) {
      return value ? `${(Number(value) * 100).toFixed(2)}%` : '0.00%'
    },
    getProgressColor(percentage) {
      if (percentage < 30) return '#f56c6c'
      if (percentage < 60) return '#e6a23c'
      if (percentage < 80) return '#409eff'
      return '#67c23a'
    },
    getAssessmentTypeTagType(type) {
      switch (type) {
        case 1:
          return 'primary'
        case 2:
          return 'success'
        default:
          return 'info'
      }
    },
    getAssessmentTypeText(type) {
      switch (type) {
        case 1:
          return '合作社'
        case 2:
          return '养殖户/养殖企业'
        default:
          return '未知对象'
      }
    }
  }
}
</script>

<style scoped>
.asset-assessment-detail {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.back-btn {
  font-size: 16px;
  margin-right: 16px;
  color: #409eff;
}

.page-title h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.status-tag {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
}

.status-tag i {
  margin-right: 4px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 信息卡片 */
.info-card, .breeding-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-title i {
  margin-right: 8px;
  color: #409eff;
}

.card-extra {
  display: flex;
  align-items: center;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.info-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.info-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
  font-weight: 600;
  margin-bottom: 8px;
}

.info-label i {
  margin-right: 6px;
  color: #409eff;
}

.info-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.remark-section {
  margin-top: 24px;
  padding: 20px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #e1f5fe;
}

.remark-content {
  margin-top: 8px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  line-height: 1.6;
  color: #303133;
}

/* 表格样式 */
.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.breeding-table {
  border-radius: 8px;
}

.farm-info .farm-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.farm-info .farm-code {
  font-size: 12px;
  color: #909399;
}

.breed-info .breed-name {
  margin-bottom: 4px;
}

.breed-info .breed-type {
  font-size: 12px;
  color: #606266;
}

.stock-info {
  text-align: center;
}

.stock-info .stock-quantity {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stock-info .stock-unit {
  font-size: 12px;
  color: #909399;
}

.price-info .price-value {
  font-weight: 600;
  color: #f56c6c;
}

.price-info .price-unit {
  font-size: 12px;
  color: #909399;
}

.total-price {
  font-size: 16px;
  font-weight: 700;
  color: #67c23a;
}

.coefficient-text {
  margin-top: 4px;
  font-size: 12px;
  text-align: center;
  color: #606266;
}

.time-info .date {
  font-weight: 600;
  color: #303133;
}

.time-info .time {
  font-size: 12px;
  color: #909399;
}

/* 操作栏 */
.action-bar {
  margin-top: 32px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .asset-assessment-detail {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    flex-wrap: wrap;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .action-bar {
    flex-direction: column;
  }
}

/* 加载动画 */
.el-loading-mask {
  border-radius: 8px;
}

/* 表格斑马纹效果 */
.breeding-table .el-table__row:nth-child(even) {
  background-color: #fafafa;
}

.breeding-table .el-table__row:hover {
  background-color: #f0f9ff !important;
}
</style> 