<template>
  <div class="credit-detail-container">
    <el-card v-loading="loading" :bordered="false" shadow="never">
      <!-- 页面头部 -->
      <div slot="header" class="card-header">
        <div class="header-left">
          <el-button type="text" @click="$router.go(-1)">
            <i class="el-icon-arrow-left"></i> 返回
          </el-button>
          <span class="page-title">授信申请详情</span>
        </div>
        <div class="header-right">
          <el-tag 
            :type="getStatusType(detail.auditStatus)" 
            size="medium"
          >
            {{ getStatusText(detail.auditStatus) }}
          </el-tag>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="detail-section">
        <h3 class="section-title">基本信息</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>用户名称：</label>
              <span>{{ detail.userName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>负责人姓名：</label>
              <span>{{ detail.managerName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>身份证号/信用代码：</label>
              <span>{{ detail.idNumber || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>联系电话：</label>
              <span>{{ detail.managerPhone || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>申请类型：</label>
              <el-tag :type="detail.applyType === 0 ? 'primary' : 'success'" size="small">
                {{ detail.applyType === 0 ? '社员申请' : '合作社申请' }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>申请时间：</label>
              <span>{{ detail.applyTime | formatDate }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 养殖信息 -->
      <div class="detail-section">
        <h3 class="section-title">养殖信息</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>养殖场名称：</label>
              <span>{{ detail.farmName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>资产评估ID：</label>
              <span>{{ detail.assessmentId || '-' }}</span>
              <el-button 
                v-if="detail.assessmentId"
                type="text" 
                size="mini" 
                @click="viewAssessment(detail.assessmentId)"
                style="margin-left: 10px;"
              >
                查看评估详情
              </el-button>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>申请备注：</label>
              <span>{{ detail.remark || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 资产评估品种信息 -->
      <div class="detail-section">
        <h3 class="section-title">资产评估品种信息</h3>
        <el-table
          v-loading="breedingLoading"
          :data="breedingList"
          size="small"
          border
          empty-text="暂无数据"
        >
          <el-table-column prop="farmName" label="养殖场" min-width="150" show-overflow-tooltip />
          <el-table-column prop="breedName" label="品种名称" min-width="120" />
          <el-table-column prop="breedType" label="品种类型" min-width="120" />
          <el-table-column prop="stockQuantity" label="存栏数量" min-width="100" align="center">
            <template slot-scope="scope">
              {{ formatNumber(scope.row.stockQuantity) }}{{ scope.row.assessmentUnit || '头' }}
            </template>
          </el-table-column>
          <el-table-column prop="assessmentPrice" label="评估单价" min-width="120" align="center">
            <template slot-scope="scope">
              ¥{{ formatAmount(scope.row.assessmentPrice) }}/{{ scope.row.assessmentUnit || '头' }}
            </template>
          </el-table-column>
          <el-table-column prop="assessmentTotalPrice" label="评估总价" min-width="120" align="center">
            <template slot-scope="scope">
              ¥{{ formatAmount(scope.row.assessmentTotalPrice) }}
            </template>
          </el-table-column>
          <el-table-column prop="creditCoefficient" label="授信系数" min-width="100" align="center">
            <template slot-scope="scope">
              {{ formatPercent(scope.row.creditCoefficient) }}
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 统计信息 -->
        <div v-if="breedingList.length > 0" class="breeding-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="summary-item">
                <span class="label">总品种数：</span>
                <span class="value">{{ breedingList.length }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <span class="label">总存栏量：</span>
                <span class="value">{{ getTotalStock() }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <span class="label">总评估价值：</span>
                <span class="value amount-text">¥{{ formatAmount(getTotalValue()) }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <span class="label">平均单价：</span>
                <span class="value">¥{{ formatAmount(getAveragePrice()) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 申请信息 -->
      <div class="detail-section">
        <h3 class="section-title">申请信息</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>申请金额：</label>
              <span class="amount-text">￥{{ detail.applyAmount || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="info-item">
              <label>申请备注：</label>
              <span>{{ detail.remark || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 授信信息 -->
      <div v-if="detail.auditStatus === 2" class="detail-section">
        <h3 class="section-title">授信信息</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>授信额度：</label>
              <span class="amount-text success">￥{{ detail.totalAmount || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>可用额度：</label>
              <span class="amount-text">￥{{ detail.availableCreditAmount || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>已用额度：</label>
              <span class="amount-text warning">￥{{ getUsedAmount() }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>授信利率：</label>
              <span>{{ detail.creditRatio && !isNaN(detail.creditRatio) ? Number(detail.creditRatio).toFixed(1) + '‰' : '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>授信期限：</label>
              <span>{{ detail.creditPeriod || '-' }}个月</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>授信开始时间：</label>
              <span>{{ detail.creditStartTime | formatDate }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>POS卡号：</label>
              <span>{{ detail.cardNumber || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>待还金额：</label>
              <span class="amount-text danger">￥{{ detail.totalRepaymentAmount || 0 }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 担保人信息 -->
      <div v-if="detail.guarantors && detail.guarantors.length > 0" class="detail-section">
        <h3 class="section-title">担保人信息</h3>
        <el-table
          :data="detail.guarantors"
          size="small"
          border
        >
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column prop="idNumber" label="身份证号" min-width="180" />
          <el-table-column prop="mobile" label="联系电话" min-width="120" />
          <el-table-column prop="relation" label="关系" min-width="100" />
          <el-table-column prop="guaranteeAmount" label="担保金额" min-width="120">
            <template slot-scope="scope">
              <span class="amount-text">￥{{ scope.row.guaranteeAmount || 0 }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 审核信息 -->
      <div v-if="detail.auditStatus !== 0" class="detail-section">
        <h3 class="section-title">审核信息</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>审核状态：</label>
              <el-tag 
                :type="getStatusType(detail.auditStatus)" 
                size="small"
              >
                {{ getStatusText(detail.auditStatus) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>审核时间：</label>
              <span>{{ detail.auditTime | formatDate }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="info-item">
              <label>审核备注：</label>
              <div class="remark-content">
                {{ detail.auditRemark || '-' }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 操作按钮 -->
      <div v-if="detail.auditStatus === 0" class="action-section">
        <el-button type="primary" @click="handleAudit">审核</el-button>
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

    <!-- 资产评估详情对话框 -->
    <el-dialog
      title="资产评估详情"
      :visible.sync="assessmentDialog.visible"
      width="80%"
      :close-on-click-modal="false"
    >
      <AssetAssessmentDetail
        v-if="assessmentDialog.visible && assessmentDialog.id"
        :assessment-id="assessmentDialog.id"
        @close="closeAssessmentDialog"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeAssessmentDialog">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  creditApplicationDetailApi,
  creditApplicationAuditApi
} from '@/api/credit'
import { getByCreditApplicationId } from '@/api/assetAssessmentBreeding'
import AssetAssessmentDetail from '@/views/finance/asset/detail'

export default {
  name: 'CreditApplicationDetail',
  components: {
    AssetAssessmentDetail
  },
  data() {
    return {
      loading: false,
      detail: {
        auditStatus: null,
        userName: '',
        managerName: '',
        farmName: '',
        idNumber: '',
        managerPhone: '',
        applyType: null,
        applyTime: null,
        applyAmount: null,
        totalAmount: null,
        availableCreditAmount: null,
        creditRatio: null,
        creditPeriod: null,
        creditStartTime: null,
        cardNumber: '',
        totalRepaymentAmount: null,
        auditTime: null,
        auditRemark: '',
        remark: '',
        guarantors: []
      },
      breedingLoading: false,
      breedingList: [],
      auditDialog: {
        visible: false,
        loading: false
      },
      assessmentDialog: {
        visible: false,
        id: null
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
        auditRemark: [
          { 
            validator: (rule, value, callback) => {
              if (this.auditForm.auditStatus === 1 && (!value || value.trim() === '')) {
                callback(new Error('审核拒绝时必须填写拒绝原因'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ]
      }
    }
  },
  mounted() {
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      this.loading = true
      try {
        const id = this.$route.params.id
        console.log('获取详情，ID:', id)
        const response = await creditApplicationDetailApi(id)
        console.log('详情API响应:', response)
        
        // 响应拦截器已经处理了数据，response 直接就是 data 内容
        if (response && typeof response === 'object') {
          this.detail = response
          console.log('详情数据更新完成:', this.detail)
          
          // 直接从详情响应中获取品种信息
          if (response.assessmentBreedingList) {
            this.breedingList = response.assessmentBreedingList
            console.log('从详情响应中获取到品种信息:', this.breedingList)
          } else {
            console.log('详情响应中没有品种信息，尝试单独加载')
            // 如果详情中没有品种信息，再尝试单独加载
            this.loadBreedingList(id)
          }
        } else {
          console.error('详情API调用失败或数据为空:', response)
          this.$message.error('获取详情失败：数据为空')
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败')
      } finally {
        this.loading = false
      }
    },

    // 加载品种信息
    async loadBreedingList(applicationId) {
      this.breedingLoading = true
      try {
        const response = await getByCreditApplicationId(applicationId)
        this.breedingList = response || []  // 响应拦截器已处理数据层级
        console.log('品种信息加载完成:', this.breedingList)
      } catch (error) {
        console.error('获取品种信息失败:', error)
        this.breedingList = []
      } finally {
        this.breedingLoading = false
      }
    },
    
    handleAudit() {
      this.auditForm = {
        id: this.detail.id,
        auditStatus: 2,
        creditAmount: this.detail.applyAmount || null,
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
          // 额外的业务验证
          if (!this.validateAuditForm()) {
            return
          }
          
          this.auditDialog.loading = true
          try {
            await creditApplicationAuditApi(this.auditForm)
            this.$message.success('审核成功')
            this.auditDialog.visible = false
            this.loadDetail()
          } catch (error) {
            this.$message.error('审核失败：' + (error.message || '未知错误'))
          } finally {
            this.auditDialog.loading = false
          }
        }
      })
    },
    
    validateAuditForm() {
      // 审核通过时的验证
      if (this.auditForm.auditStatus === 2) {
        if (!this.auditForm.creditAmount || this.auditForm.creditAmount <= 0) {
          this.$message.error('审核通过时授信额度不能为空且必须大于0')
          return false
        }
        if (!this.auditForm.creditRatio || this.auditForm.creditRatio <= 0) {
          this.$message.error('审核通过时授信利率不能为空且必须大于0')
          return false
        }
        if (this.auditForm.creditRatio > 1000) {
          this.$message.error('授信利率不能大于1000‰')
          return false
        }
        if (!this.auditForm.creditPeriod || this.auditForm.creditPeriod <= 0) {
          this.$message.error('审核通过时授信期限不能为空且必须大于0')
          return false
        }
        if (this.auditForm.creditPeriod > 120) {
          this.$message.error('授信期限不能大于120个月')
          return false
        }
      }
      // 审核拒绝时的验证
      else if (this.auditForm.auditStatus === 1) {
        if (!this.auditForm.auditRemark || this.auditForm.auditRemark.trim() === '') {
          this.$message.error('审核拒绝时必须填写拒绝原因')
          return false
        }
      }
      
      return true
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
    },
    
    getUsedAmount() {
      if (this.detail.totalAmount && this.detail.availableCreditAmount) {
        return (this.detail.totalAmount - this.detail.availableCreditAmount).toFixed(2)
      }
      return '0.00'
    },

    // 格式化金额
    formatAmount(value) {
      if (!value && value !== 0) return '0.00'
      return Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    // 格式化数字
    formatNumber(value) {
      if (!value && value !== 0) return '0'
      return Number(value).toLocaleString('zh-CN')
    },

    // 格式化百分比
    formatPercent(value) {
      if (!value && value !== 0) return '0.00%'
      return (Number(value) * 100).toFixed(2) + '%'
    },

    // 获取总存栏量
    getTotalStock() {
      return this.breedingList.reduce((sum, item) => {
        const quantity = Number(item.stockQuantity) || 0
        return sum + quantity
      }, 0)
    },

    // 获取总评估价值
    getTotalValue() {
      console.log('计算总评估价值，原始数据:', this.breedingList)
      const result = this.breedingList.reduce((sum, item) => {
        const totalPrice = Number(item.assessmentTotalPrice) || 0
        console.log(`品种 ${item.breedName}: assessmentTotalPrice=${item.assessmentTotalPrice}, 转换后=${totalPrice}`)
        return sum + totalPrice
      }, 0)
      console.log('总评估价值计算结果:', result)
      return result
    },

    // 获取平均单价
    getAveragePrice() {
      console.log('计算平均单价，原始数据:', this.breedingList)
      const validItems = this.breedingList.filter(item => {
        const price = Number(item.assessmentPrice) || 0
        console.log(`品种 ${item.breedName}: assessmentPrice=${item.assessmentPrice}, 转换后=${price}`)
        return price > 0
      })
      
      console.log('有效价格项目数量:', validItems.length)
      if (validItems.length === 0) return 0
      
      const totalPrice = validItems.reduce((sum, item) => {
        const price = Number(item.assessmentPrice) || 0
        return sum + price
      }, 0)
      
      const averagePrice = totalPrice / validItems.length
      console.log('平均单价计算结果:', averagePrice)
      return averagePrice
    },

    // 查看资产评估详情
    viewAssessment(assessmentId) {
      if (!assessmentId) {
        this.$message.warning('无资产评估信息')
        return
      }
      this.assessmentDialog.id = assessmentId
      this.assessmentDialog.visible = true
    },

    // 关闭资产评估对话框
    closeAssessmentDialog() {
      this.assessmentDialog.visible = false
      this.assessmentDialog.id = null
    }
  }
}
</script>

<style scoped>
.credit-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
}

.detail-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fafafa;
  border-radius: 4px;
}

.section-title {
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
}

.info-item label {
  min-width: 120px;
  font-weight: bold;
  color: #606266;
  margin-right: 10px;
}

.info-item span {
  color: #303133;
  word-break: break-all;
}

.amount-text {
  font-weight: bold;
  font-size: 16px;
}

.amount-text.success {
  color: #67c23a;
}

.amount-text.warning {
  color: #e6a23c;
}

.amount-text.danger {
  color: #f56c6c;
}

.remark-content {
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  min-height: 60px;
  color: #303133;
}

.action-section {
  text-align: center;
  padding: 20px 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.breeding-summary {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.summary-item {
  text-align: center;
  padding: 10px;
}

.summary-item .label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.summary-item .value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
</style> 