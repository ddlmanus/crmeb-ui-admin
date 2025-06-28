<template>
  <div class="credit-application-container">
    <el-card :bordered="false" shadow="never" class="ivu-mt" :body-style="{ padding: 0 }">
      <!-- 搜索条件 -->
      <div class="padding-add">
        <el-form inline label-position="right" @submit.native.prevent>
          <el-form-item label="审核状态：">
            <el-select
              v-model="searchForm.auditStatus"
              clearable
              size="small"
              placeholder="请选择审核状态"
              class="selWidth"
              @change="handleSearch"
            >
              <el-option label="待审核" :value="0" />
              <el-option label="已拒绝" :value="1" />
              <el-option label="已通过" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请人类型：">
            <el-select
              v-model="searchForm.applyType"
              clearable
              size="small"
              placeholder="请选择申请人类型"
              class="selWidth"
              @change="handleSearch"
            >
              <el-option label="社员申请" :value="0" />
              <el-option label="合作社申请" :value="1" />
            </el-select>
          </el-form-item>
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
          <el-form-item label="联系电话：">
            <el-input
              v-model="searchForm.mobile"
              placeholder="请输入联系电话"
              class="selWidth"
              size="small"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
            <el-button size="small" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计卡片 -->
      <div class="statistics-cards" style="padding: 0 20px 20px;">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-number">{{ (statistics && statistics.totalCount) || 0 }}</div>
                <div class="stat-label">总申请数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-number pending">{{ (statistics && statistics.pendingCount) || 0 }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-number approved">{{ (statistics && statistics.approvedCount) || 0 }}</div>
                <div class="stat-label">已通过</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-item">
                <div class="stat-number rejected">{{ (statistics && statistics.rejectedCount) || 0 }}</div>
                <div class="stat-label">已拒绝</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData.data"
        size="small"
        class="table"
        highlight-current-row
      >
        <el-table-column prop="userName" label="用户名称" min-width="120" />
        <el-table-column prop="farmName" label="养殖场名称" min-width="150" />
        <el-table-column prop="managerName" label="负责人姓名" min-width="120" />
        <el-table-column prop="managerPhone" label="联系电话" min-width="120" />
        <el-table-column prop="idNumber" label="证件号码" min-width="180">
          <template slot-scope="scope">
            <span v-if="scope.row.idNumber">{{ scope.row.idNumber }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="applyAmount" label="申请金额" min-width="100">
          <template slot-scope="scope">
            <span style="color: #f56c6c;">￥{{ scope.row.applyAmount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="授信额度" min-width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.totalAmount" style="color: #67c23a;">￥{{ scope.row.totalAmount }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="creditRatio" label="授信利率" min-width="80">
          <template slot-scope="scope">
            <span v-if="scope.row.creditRatio && !isNaN(scope.row.creditRatio)">{{ Number(scope.row.creditRatio).toFixed(1) }}‰</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="applyType" label="申请类型" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.applyType === 0 ? 'primary' : 'success'" size="small">
              {{ scope.row.applyType === 0 ? '社员申请' : '合作社申请' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" min-width="100">
          <template slot-scope="scope">
            <el-tag 
              :type="getStatusType(scope.row.auditStatus)" 
              size="small"
            >
              {{ getStatusText(scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" min-width="150">
          <template slot-scope="scope">
            {{ scope.row.applyTime | formatDate }}
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" min-width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.auditTime">{{ scope.row.auditTime | formatDate }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              v-if="scope.row.auditStatus === 0" 
              type="text" 
              size="small" 
              @click="handleAudit(scope.row)"
            >
              审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="searchForm.pageNumber"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="searchForm.pageSize"
          :total="tableData.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog
      title="授信申请审核"
      :visible.sync="auditDialog.visible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="auditForm"
        :model="auditForm"
        :rules="auditRules"
        label-width="120px"
      >
        <el-form-item label="审核结果" prop="auditStatus">
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio :label="2">通过</el-radio>
            <el-radio :label="1">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <template v-if="auditForm.auditStatus === 2">
          <el-form-item label="授信额度" prop="creditAmount">
            <el-input-number
              v-model="auditForm.creditAmount"
              :min="0"
              :precision="2"
              placeholder="请输入授信额度"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="授信利率" prop="creditRatio">
            <el-input-number
              v-model="auditForm.creditRatio"
              :min="0"
              :max="1000"
              :step="0.1"
              :precision="1"
              placeholder="请输入授信利率（千分比）"
              style="width: 100%"
            />
            <div class="form-tip">例如：15 表示 15‰</div>
          </el-form-item>
          <el-form-item label="授信期限" prop="creditPeriod">
            <el-input-number
              v-model="auditForm.creditPeriod"
              :min="1"
              :max="120"
              placeholder="请输入授信期限"
              style="width: 100%"
            />
            <div class="form-tip">单位：月</div>
          </el-form-item>
          <el-form-item label="POS卡号" prop="cardNumber">
            <el-input
              v-model="auditForm.cardNumber"
              placeholder="请输入POS卡号"
            />
          </el-form-item>
        </template>
        
        <el-form-item label="审核备注" prop="auditRemark">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="auditDialog.loading" @click="handleAuditSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  creditApplicationPageApi,
  creditApplicationAuditApi,
  creditApplicationStatisticsApi
} from '@/api/credit'

export default {
  name: 'CreditApplication',
  data() {
    return {
      loading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        auditStatus: null,
        applyType: null,
        userName: '',
        mobile: ''
      },
      tableData: {
        data: [],
        total: 0
      },
      statistics: {
        totalCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
      },
      auditDialog: {
        visible: false,
        loading: false
      },
      auditForm: {
        id: '',
        auditStatus: 2,
        creditAmount: null,
        creditRatio: null,
        creditPeriod: 12,
        cardNumber: '',
        auditRemark: ''
      },
      auditRules: {
        auditStatus: [
          { required: true, message: '请选择审核结果', trigger: 'change' }
        ],
        creditAmount: [
          { required: true, message: '请输入授信额度', trigger: 'blur' }
        ],
        creditRatio: [
          { required: true, message: '请输入授信利率', trigger: 'blur' }
        ],
        creditPeriod: [
          { required: true, message: '请输入授信期限', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.loadData()
    this.loadStatistics()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        console.log('开始加载列表数据...')
        const response = await creditApplicationPageApi(this.searchForm)
        console.log('列表API响应:', response)
        
        if (response && typeof response === 'object' && response.list) {
          this.tableData.data = response.list || []
          this.tableData.total = response.total || 0
          console.log('列表数据更新完成:', this.tableData)
        } else {
          console.error('列表API调用失败或数据为空:', response)
          this.tableData.data = []
          this.tableData.total = 0
        }
      } catch (error) {
        console.error('获取列表数据失败:', error)
        this.tableData.data = []
        this.tableData.total = 0
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        console.log('开始加载统计数据...')
        const response = await creditApplicationStatisticsApi()
        console.log('统计API响应:', response)
        
        // 响应拦截器已经处理了数据，response 直接就是 data 内容
        if (response && typeof response === 'object') {
          console.log('统计数据:', response)
          
          // 直接更新统计数据
          this.statistics.totalCount = response.totalCount || 0
          this.statistics.pendingCount = response.pendingCount || 0
          this.statistics.approvedCount = response.approvedCount || 0
          this.statistics.rejectedCount = response.rejectedCount || 0
          
          console.log('统计数据更新完成:', this.statistics)
          
          // 强制更新视图
          this.$forceUpdate()
        } else {
          console.error('统计API调用失败或数据为空:', response)
          this.resetStatistics()
        }
        
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.resetStatistics()
      }
    },
    
    resetStatistics() {
      this.statistics.totalCount = 0
      this.statistics.pendingCount = 0
      this.statistics.approvedCount = 0
      this.statistics.rejectedCount = 0
      this.$forceUpdate()
    },
    
    handleSearch() {
      this.searchForm.pageNumber = 1
      this.loadData()
    },
    
    handleReset() {
      this.searchForm = {
        pageNumber: 1,
        pageSize: 20,
        auditStatus: null,
        applyType: null,
        userName: '',
        mobile: ''
      }
      this.loadData()
    },
    
    handleSizeChange(size) {
      this.searchForm.pageSize = size
      this.loadData()
    },
    
    handleCurrentChange(page) {
      this.searchForm.pageNumber = page
      this.loadData()
    },
    
    handleView(row) {
      if (!row || !row.id) {
        this.$message.error('无效的申请记录')
        return
      }
      this.$router.push({
        name: 'CreditApplicationDetail',
        params: { id: row.id }
      })
    },
    
    handleAudit(row) {
      this.auditForm = {
        id: row.id,
        auditStatus: 2,
        creditAmount: row.applyAmount || null,
        creditRatio: null,
        creditPeriod: 12,
        cardNumber: '',
        auditRemark: ''
      }
      this.auditDialog.visible = true
    },
    
    handleAuditSubmit() {
      this.$refs.auditForm.validate(async (valid) => {
        if (valid) {
          this.auditDialog.loading = true
          try {
            await creditApplicationAuditApi(this.auditForm)
            this.$message.success('审核成功')
            this.auditDialog.visible = false
            this.loadData()
            this.loadStatistics()
          } catch (error) {
            this.$message.error('审核失败')
          } finally {
            this.auditDialog.loading = false
          }
        }
      })
    },
    
    getStatusType(status) {
      const statusMap = {
        0: 'warning',
        1: 'danger', 
        2: 'success'
      }
      return statusMap[status] || 'info'
    },
    
    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '已拒绝',
        2: '已通过'
      }
      return statusMap[status] || '未知'
    }
  }
}
</script>

<style scoped>
.credit-application-container {
  padding: 20px;
}

.padding-add {
  padding: 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.selWidth {
  width: 200px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-item {
  padding: 10px 0;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-number.pending {
  color: #e6a23c;
}

.stat-number.approved {
  color: #67c23a;
}

.stat-number.rejected {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.table {
  margin: 0;
}

.pagination-container {
  padding: 20px;
  text-align: right;
  background: #fff;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style> 