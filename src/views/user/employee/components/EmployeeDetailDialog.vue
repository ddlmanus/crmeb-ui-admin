<template>
  <el-dialog
    title="员工详情"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="员工姓名">
          {{ employeeDetail.name }}
        </el-descriptions-item>
        <el-descriptions-item label="员工工号">
          {{ employeeDetail.employeeNo }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ employeeDetail.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ employeeDetail.email || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="身份证号">
          {{ employeeDetail.idCard || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ getGenderText(employeeDetail.gender) }}
        </el-descriptions-item>
        <el-descriptions-item label="所属养殖机构">
          {{ employeeDetail.farmName || '未分配' }}
        </el-descriptions-item>
        <el-descriptions-item label="员工状态">
          <el-tag :type="getStatusTagType(employeeDetail.status)" size="small">
            {{ employeeDetail.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="地址">
          {{ employeeDetail.address || '未填写' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">养殖组织信息</el-divider>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="养殖场名称">
          {{ employeeDetail.farmName || '未分配' }}
        </el-descriptions-item>
        <el-descriptions-item label="养殖场编码">
          {{ employeeDetail.farmCode || '未分配' }}
        </el-descriptions-item>
        <el-descriptions-item label="养殖品种名称">
          {{ employeeDetail.breedingVarietyNames || '暂无' }}
        </el-descriptions-item>
        <el-descriptions-item label="品种类型">
          {{ employeeDetail.breedingVarietyTypes || '暂无' }}
        </el-descriptions-item>
        <el-descriptions-item label="总存栏量">
          <span class="text-info">{{ employeeDetail.totalStockQuantity || 0 }}头</span>
        </el-descriptions-item>
        <el-descriptions-item label="评估金额">
          <span class="text-warning">{{ formatMoney(employeeDetail.assessmentAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="授信系数">
          <span class="text-primary">{{ formatPercent(employeeDetail.creditCoefficient) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="授信额度">
          <span class="text-success">{{ formatMoney(employeeDetail.creditLimit) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已消费金额">
          <span class="text-danger">{{ formatMoney(employeeDetail.consumedAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="可用额度">
          <span class="text-primary">{{ formatMoney(getAvailableCredit()) }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">其他信息</el-divider>
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="个人简介">
          {{ employeeDetail.biography || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          {{ employeeDetail.remark || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ employeeDetail.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ employeeDetail.updateTime }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { employeeDetailApi } from '@/api/employee'

export default {
  name: 'EmployeeDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    employeeId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      loading: false,
      employeeDetail: {}
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val && this.employeeId) {
        this.getEmployeeDetail()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 获取员工详情
    async getEmployeeDetail() {
      this.loading = true
      try {
        const response = await employeeDetailApi(this.employeeId)
        console.log('员工详情API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let data = {}
        if (response.code === 200 && response.data) {
          data = response.data
        } else if (response.data) {
          data = response.data
        } else if (response) {
          data = response
        }
        
        this.employeeDetail = data || {}
        console.log('员工详情数据:', this.employeeDetail)
      } catch (error) {
        console.error('获取员工详情失败', error)
        this.employeeDetail = {}
        const message = error.response?.data?.msg || '获取员工详情失败'
        this.$message.error(message)
      } finally {
        this.loading = false
      }
    },

    // 获取性别文本
    getGenderText(gender) {
      const genderMap = {
        0: '未知',
        1: '男',
        2: '女'
      }
      return genderMap[gender] || '未知'
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      const statusMap = {
        0: 'info',    // 离职
        1: 'success', // 在职
        2: 'warning'  // 试用期
      }
      return statusMap[status] || 'info'
    },

    // 格式化金额
    formatMoney(amount) {
      if (!amount) return '¥0.00'
      return `¥${Number(amount).toFixed(2)}`
    },

    // 格式化百分比
    formatPercent(value) {
      if (!value || value === 0) return '0.00%'
      const percent = (Number(value) * 100).toFixed(2)
      return `${percent}%`
    },

    // 获取可用授信额度
    getAvailableCredit() {
      const creditLimit = Number(this.employeeDetail.creditLimit) || 0
      const consumedAmount = Number(this.employeeDetail.consumedAmount) || 0
      return Math.max(0, creditLimit - consumedAmount)
    }
  }
}
</script>

<style scoped>
.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.text-primary {
  color: #409eff;
}

.text-info {
  color: #909399;
}

.text-warning {
  color: #e6a23c;
}

.el-divider {
  margin: 20px 0;
}
</style> 