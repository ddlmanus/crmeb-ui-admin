<template>
  <div class="credit-transaction-container">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <!-- 搜索条件 -->
      <div class="padding-add">
        <el-form inline label-position="right" @submit.native.prevent>
          <el-form-item label="用户名称：">
            <el-input
              v-model="searchForm.userName"
              placeholder="请输入用户名称"
              class="selWidth"
              size="small"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item label="交易类型：">
            <el-select
              v-model="searchForm.transactionType"
              clearable
              size="small"
              placeholder="请选择交易类型"
              class="selWidth"
              @change="handleSearch"
            >
              <el-option label="授信消费" :value="0" />
              <el-option label="还款" :value="1" />
              <el-option label="额度调整" :value="2" />
              <el-option label="退款" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="订单号：">
            <el-input
              v-model="searchForm.orderSn"
              placeholder="请输入订单号"
              class="selWidth"
              size="small"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item label="交易时间：">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              size="small"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              @change="handleDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
            <el-button size="small" @click="handleReset">重置</el-button>
            <!-- <el-button type="success" size="small" @click="handleExport">导出</el-button> -->
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计卡片 -->
      <div class="statistics-cards" style="padding: 0 20px 20px;">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-number">{{ statistics.totalTransactions || 0 }}</div>
                <div class="stat-label">总交易数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-number consumption">{{ statistics.consumptionCount || 0 }}</div>
                <div class="stat-label">消费笔数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-number repayment">{{ statistics.repaymentCount || 0 }}</div>
                <div class="stat-label">还款笔数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-number total-amount">￥{{ formatAmount(statistics.totalAmount) }}</div>
                <div class="stat-label">交易总额</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData.records"
        size="small"
        class="table"
        highlight-current-row
      >
        <el-table-column prop="id" label="交易ID" min-width="120" show-overflow-tooltip />
        <el-table-column prop="userName" label="用户名称" min-width="120" />
        <el-table-column prop="transactionType" label="交易类型" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getTransactionTypeTag(scope.row.transactionType)" size="small">
              {{ getTransactionTypeText(scope.row.transactionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="transactionAmount" label="交易金额" min-width="120">
          <template slot-scope="scope">
            <span :class="getAmountClass(scope.row.transactionType)">
              {{ formatTransactionAmount(scope.row.transactionAmount, scope.row.transactionType) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="beforeAvailableAmount" label="交易前额度" min-width="120">
          <template slot-scope="scope">
            <span>￥{{ formatAmount(scope.row.beforeAvailableAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="afterAvailableAmount" label="交易后额度" min-width="120">
          <template slot-scope="scope">
            <span>￥{{ formatAmount(scope.row.afterAvailableAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderId" label="关联订单" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.orderId">{{ scope.row.orderId }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="transactionDescription" label="交易说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="transactionTime" label="交易时间" min-width="150">
          <template slot-scope="scope">
            {{ scope.row.transactionTime | formatDate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="searchForm.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="searchForm.limit"
          :total="tableData.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 额度调整对话框 -->
    <el-dialog
      title="授信额度调整"
      :visible.sync="adjustmentDialog.visible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="adjustmentForm"
        :model="adjustmentForm"
        :rules="adjustmentRules"
        label-width="100px"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="adjustmentForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="调整金额" prop="amount">
          <el-input-number
            v-model="adjustmentForm.amount"
            :precision="2"
            :step="100"
            :min="-999999"
            :max="999999"
            placeholder="正数为增加，负数为减少"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="调整说明" prop="description">
          <el-input
            v-model="adjustmentForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入调整说明"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="adjustmentDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="adjustmentDialog.loading" @click="handleAdjustmentSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCreditTransactionList, getCreditTransactionDetail, createCreditAdjustment, getCreditTransactionStatistics } from '@/api/finance/creditTransaction'

export default {
  name: 'CreditTransactionIndex',
  data() {
    return {
      loading: false,
      searchForm: {
        page: 1,
        limit: 10,
        userName: '',
        transactionType: null,
        orderSn: '',
        startTime: '',
        endTime: ''
      },
      dateRange: [],
      tableData: {
        records: [],
        total: 0
      },
      statistics: {
        totalTransactions: 0,
        consumptionCount: 0,
        repaymentCount: 0,
        totalAmount: 0
      },
      adjustmentDialog: {
        visible: false,
        loading: false
      },
      adjustmentForm: {
        userId: '',
        amount: null,
        description: ''
      },
      adjustmentRules: {
        userId: [
          { required: true, message: '请输入用户ID', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '请输入调整金额', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入调整说明', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getStatistics()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.loading = true
      getCreditTransactionList(this.searchForm).then(response => {
        console.log('API Response:', response) // 调试日志
        // 响应拦截器已经处理了CommonResult，直接使用返回的数据
        if (response && response.list) {
          this.tableData.records = response.list
          this.tableData.total = response.total
        } else {
          this.tableData.records = []
          this.tableData.total = 0
        }
        this.loading = false
      }).catch(error => {
        console.error('API Error:', error) // 调试日志
        this.tableData.records = []
        this.tableData.total = 0
        this.loading = false
      })
    },

    // 获取统计数据
    getStatistics() {
      getCreditTransactionStatistics(this.searchForm).then(response => {
        console.log('Statistics Response:', response) // 调试日志
        // 响应拦截器已经处理了CommonResult，直接使用返回的数据
        this.statistics = response || {}
      }).catch(error => {
        console.error('Statistics Error:', error) // 调试日志
        // 统计数据获取失败时使用默认值
      })
    },

    // 搜索
    handleSearch() {
      this.searchForm.page = 1
      this.getList()
      this.getStatistics()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        page: 1,
        limit: 10,
        userName: '',
        transactionType: null,
        orderSn: '',
        startTime: '',
        endTime: ''
      }
      this.dateRange = []
      this.getList()
      this.getStatistics()
    },

    // 日期范围变化
    handleDateChange(dates) {
      if (dates && dates.length === 2) {
        this.searchForm.startTime = dates[0]
        this.searchForm.endTime = dates[1]
      } else {
        this.searchForm.startTime = ''
        this.searchForm.endTime = ''
      }
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.searchForm.limit = size
      this.getList()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.searchForm.page = page
      this.getList()
    },

    // 查看详情
    handleView(row) {
      this.$router.push({
        path: '/finance/credit-transaction/detail',
        query: { id: row.id }
      })
    },

    // 打开额度调整对话框
    handleAdjustment() {
      this.adjustmentDialog.visible = true
      this.adjustmentForm = {
        userId: '',
        amount: null,
        description: ''
      }
    },

    // 提交额度调整
    handleAdjustmentSubmit() {
      this.$refs.adjustmentForm.validate(valid => {
        if (valid) {
          this.adjustmentDialog.loading = true
          // 将数据转换为 URLSearchParams 格式，匹配后端 @RequestParam
          const params = new URLSearchParams()
          params.append('userId', this.adjustmentForm.userId)
          params.append('amount', this.adjustmentForm.amount)
          params.append('description', this.adjustmentForm.description)
          
          createCreditAdjustment(params).then(response => {
            // 响应拦截器已经处理了CommonResult，成功时直接返回数据
            this.$message.success('额度调整成功')
            this.adjustmentDialog.visible = false
            this.adjustmentDialog.loading = false
            this.getList()
            this.getStatistics()
          }).catch(error => {
            console.error('Adjustment Error:', error)
            this.adjustmentDialog.loading = false
          })
        }
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

    // 获取交易类型标签样式
    getTransactionTypeTag(type) {
      const tagMap = {
        0: 'danger',
        1: 'success',
        2: 'warning',
        3: 'info'
      }
      return tagMap[type] || ''
    },

    // 获取金额样式类
    getAmountClass(type) {
      if (type === 0) return 'amount-out'
      if (type === 1 || type === 3) return 'amount-in'
      return 'amount-neutral'
    },

    // 格式化交易金额
    formatTransactionAmount(amount, type) {
      const prefix = type === 0 ? '-' : (type === 1 || type === 3 ? '+' : '')
      return `${prefix}￥${this.formatAmount(amount)}`
    },

    // 格式化金额
    formatAmount(amount) {
      if (!amount && amount !== 0) return '0.00'
      // 处理BigDecimal或字符串格式的金额
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
      if (isNaN(numAmount)) return '0.00'
      return numAmount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.credit-transaction-container {
  .padding-add {
    padding: 20px;
    background: #fff;
  }

  .selWidth {
    width: 200px;
  }

  .statistics-cards {
    .stat-card {
      border: none;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      
      .stat-item {
        text-align: center;
        padding: 10px 0;
        
        .stat-number {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
          
          &.consumption {
            color: #f56c6c;
          }
          
          &.repayment {
            color: #67c23a;
          }
          
          &.total-amount {
            color: #409eff;
            font-size: 24px;
          }
        }
        
        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .table {
    .amount-out {
      color: #f56c6c;
      font-weight: bold;
    }
    
    .amount-in {
      color: #67c23a;
      font-weight: bold;
    }
    
    .amount-neutral {
      color: #e6a23c;
      font-weight: bold;
    }
  }

  .pagination-container {
    padding: 20px;
    text-align: right;
    background: #fff;
  }
}
</style> 