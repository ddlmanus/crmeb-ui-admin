<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="detail-header">
      <el-button 
        type="primary" 
        icon="el-icon-back" 
        @click="goBack"
      >
        返回列表
      </el-button>
      <h2 class="page-title">交易记录详情</h2>
    </div>

    <div v-loading="loading" class="detail-content">
      <el-card v-if="transactionDetail" class="detail-card">
        <!-- 交易状态卡片 -->
        <div class="status-section">
          <div class="status-header">
            <div class="status-icon" :class="getStatusIconClass(transactionDetail.transactionType)">
              <i :class="getStatusIcon(transactionDetail.transactionType)"></i>
            </div>
            <div class="status-info">
              <h3 class="transaction-type">{{ getTransactionTypeText(transactionDetail.transactionType) }}</h3>
              <div class="amount" :class="getAmountClass(transactionDetail.transactionType)">
                {{ formatAmount(transactionDetail.transactionAmount, transactionDetail.transactionType) }}
              </div>
              <div class="time">{{ parseTime(transactionDetail.transactionTime) }}</div>
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <el-divider>交易信息</el-divider>
        <div class="info-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label>交易ID：</label>
                <span>{{ transactionDetail.id }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>用户ID：</label>
                <span>{{ transactionDetail.userId }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>用户名称：</label>
                <span>{{ transactionDetail.userName || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label>交易类型：</label>
                <el-tag :type="getTransactionTypeTagType(transactionDetail.transactionType)">
                  {{ getTransactionTypeText(transactionDetail.transactionType) }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>交易金额：</label>
                <span class="amount-text" :class="getAmountClass(transactionDetail.transactionType)">
                  {{ formatAmount(transactionDetail.transactionAmount, transactionDetail.transactionType) }}
                </span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item" v-if="transactionDetail.orderSn">
                <label>关联订单：</label>
                <span>{{ transactionDetail.orderSn }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label>交易前额度：</label>
                <span>¥{{ transactionDetail.beforeAvailableAmount || 0 }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>交易后额度：</label>
                <span>¥{{ transactionDetail.afterAvailableAmount || 0 }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item" v-if="transactionDetail.interestAmount && transactionDetail.interestAmount > 0">
                <label>利息金额：</label>
                <span>¥{{ transactionDetail.interestAmount }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <div class="info-item">
                <label>交易说明：</label>
                <span>{{ transactionDetail.transactionDescription || '-' }}</span>
              </div>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label>创建时间：</label>
                <span>{{ parseTime(transactionDetail.createTime) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>更新时间：</label>
                <span>{{ parseTime(transactionDetail.updateTime) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 操作按钮 -->
        <el-divider>操作</el-divider>
        <div class="action-section">
          <el-button type="primary" @click="goBack">返回列表</el-button>
          <el-button 
            v-if="transactionDetail.transactionType === 0" 
            type="success" 
            @click="handleRepayment"
          >
            发起还款
          </el-button>
          <!-- <el-button type="info" @click="handleExport">导出详情</el-button> -->
        </div>
      </el-card>

      <div v-else class="no-data">
        <p>未找到交易记录</p>
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getCreditTransactionDetail } from '@/api/finance/creditTransaction'
import { parseTime } from '@/utils'

export default {
  name: 'CreditTransactionDetail',
  data() {
    return {
      transactionDetail: null,
      loading: false
    }
  },
  created() {
    this.getTransactionDetail()
  },
  methods: {
    // 获取交易详情
    getTransactionDetail() {
      const id = this.$route.query.id || this.$route.params.id
      console.log('Transaction ID from route:', id, 'Query:', this.$route.query, 'Params:', this.$route.params) // 调试日志
      if (!id) {
        this.$message.error('缺少交易记录ID')
        this.goBack()
        return
      }

      this.loading = true
      getCreditTransactionDetail(id).then(response => {
        console.log('Transaction Detail Response:', response) // 调试日志
        // 响应拦截器已经处理了CommonResult，成功时直接返回数据
        this.transactionDetail = response
        this.loading = false
      }).catch(error => {
        console.error('Get Transaction Detail Error:', error) // 调试日志
        this.loading = false
        this.$message.error('获取交易详情失败')
        this.goBack()
      })
    },

    // 获取交易类型文本
    getTransactionTypeText(type) {
      const typeMap = {
        0: '授信消费',
        1: '还款',
        2: '额度调整',
        3: '退款'
      }
      return typeMap[type] || '未知'
    },

    // 获取交易类型标签类型
    getTransactionTypeTagType(type) {
      const tagTypeMap = {
        0: 'danger',
        1: 'success',
        2: 'warning',
        3: 'info'
      }
      return tagTypeMap[type] || ''
    },

    // 获取状态图标
    getStatusIcon(type) {
      const iconMap = {
        0: 'el-icon-shopping-cart-2',
        1: 'el-icon-money',
        2: 'el-icon-setting',
        3: 'el-icon-refresh-left'
      }
      return iconMap[type] || 'el-icon-document'
    },

    // 获取状态图标样式
    getStatusIconClass(type) {
      if (type === 0) return 'status-out'
      if (type === 1 || type === 3) return 'status-in'
      return 'status-neutral'
    },

    // 获取金额样式类
    getAmountClass(type) {
      if (type === 0) return 'amount-out'
      if (type === 1 || type === 3) return 'amount-in'
      return 'amount-neutral'
    },

    // 格式化金额
    formatAmount(amount, type) {
      const prefix = type === 0 ? '-' : (type === 1 || type === 3 ? '+' : '')
      return `${prefix}¥${amount || 0}`
    },

    // 处理还款
    handleRepayment() {
      this.$router.push({
        path: '/finance/repaymentRecord',
        query: { transactionId: this.transactionDetail.id }
      })
    },

    // 返回列表
    goBack() {
      this.$router.push('/finance/credit-transaction')
    },

    parseTime
  }
}
</script>

<style lang="scss" scoped>
.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  .page-title {
    margin-left: 20px;
    margin-bottom: 0;
    color: #333;
  }
}

.detail-content {
  min-height: 500px;
}

.detail-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.status-section {
  .status-header {
    display: flex;
    align-items: center;
    padding: 20px 0;
    
    .status-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      
      i {
        font-size: 36px;
        color: #fff;
      }
      
      &.status-out {
        background: linear-gradient(135deg, #ff4757, #ff3742);
      }
      
      &.status-in {
        background: linear-gradient(135deg, #2ed573, #17c0eb);
      }
      
      &.status-neutral {
        background: linear-gradient(135deg, #ffa502, #ff7675);
      }
    }
    
    .status-info {
      .transaction-type {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
      }
      
      .amount {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 8px;
        
        &.amount-out {
          color: #ff4757;
        }
        
        &.amount-in {
          color: #2ed573;
        }
        
        &.amount-neutral {
          color: #ffa502;
        }
      }
      
      .time {
        color: #999;
        font-size: 14px;
      }
    }
  }
}

.info-section {
  .info-item {
    margin-bottom: 20px;
    
    label {
      font-weight: bold;
      color: #666;
      margin-right: 8px;
      min-width: 100px;
      display: inline-block;
    }
    
    span {
      color: #333;
      
      &.amount-text {
        font-weight: bold;
        
        &.amount-out {
          color: #ff4757;
        }
        
        &.amount-in {
          color: #2ed573;
        }
        
        &.amount-neutral {
          color: #ffa502;
        }
      }
    }
  }
}

.action-section {
  text-align: center;
  padding: 20px 0;
  
  .el-button {
    margin: 0 8px;
  }
}

.no-data {
  text-align: center;
  padding: 100px 0;
  color: #999;
  
  p {
    margin-bottom: 20px;
    font-size: 16px;
  }
}
</style> 