<template>
  <el-dialog
    title="编辑授信额度"
    :visible.sync="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="creditForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      size="small"
    >
      <el-form-item label="员工姓名">
        <span>{{ employeeData && employeeData.name }}</span>
      </el-form-item>
      
      <el-form-item label="员工工号">
        <span>{{ employeeData && employeeData.employeeNo }}</span>
      </el-form-item>

      <el-form-item label="养殖场名称">
        <span>{{ (employeeData && employeeData.farmName) || '未分配' }}</span>
      </el-form-item>

      <el-form-item label="养殖品种">
        <span>{{ (employeeData && employeeData.breedingVarietyNames) || '暂无' }}</span>
      </el-form-item>

      <el-form-item label="总存栏量">
        <span class="text-info">{{ (employeeData && employeeData.totalStockQuantity) || 0 }}头</span>
      </el-form-item>

      <el-form-item label="评估金额">
        <span class="text-warning">{{ formatMoney(employeeData && employeeData.assessmentAmount) }}</span>
      </el-form-item>

      <el-form-item label="授信系数" prop="creditCoefficient">
        <el-input-number
          v-model="form.creditCoefficient"
          placeholder="请输入授信系数"
          :min="0"
          :max="1"
          :step="0.01"
          :precision="2"
          style="width: 100%"
        />
        <div class="form-tip">授信系数范围为0-1，用于计算授信额度</div>
      </el-form-item>

      <el-form-item label="授信额度(元)" prop="creditLimit">
        <el-input-number
          v-model="form.creditLimit"
          placeholder="请输入授信额度"
          :min="0"
          :precision="2"
          style="width: 100%"
        />
        <div class="form-tip">建议授信额度 = 评估金额 × 授信系数</div>
      </el-form-item>

      <el-form-item label="当前已消费">
        <span class="text-danger">{{ formatMoney(employeeData && employeeData.consumedAmount) }}</span>
      </el-form-item>

      <el-form-item label="可用额度">
        <span class="text-primary">{{ formatMoney(getAvailableCredit()) }}</span>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { employeeUpdateCreditLimitApi } from '@/api/employee'

export default {
  name: 'CreditEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    employeeData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      submitting: false,
      form: {
        creditCoefficient: 0,
        creditLimit: 0
      },
      rules: {
        creditCoefficient: [
          { required: true, message: '请输入授信系数', trigger: 'blur' },
          { type: 'number', min: 0, max: 1, message: '授信系数必须在0-1之间', trigger: 'blur' }
        ],
        creditLimit: [
          { required: true, message: '请输入授信额度', trigger: 'blur' },
          { type: 'number', min: 0, message: '授信额度不能小于0', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initForm()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 初始化表单
    initForm() {
      if (this.employeeData) {
        this.form = {
          creditCoefficient: this.employeeData.creditCoefficient || 0,
          creditLimit: this.employeeData.creditLimit || 0
        }
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.creditForm.validate(async (valid) => {
        if (!valid) return

        this.submitting = true
        try {
          await employeeUpdateCreditLimitApi(
            this.employeeData.id,
            this.form.creditLimit,
            this.form.creditCoefficient
          )
          this.$message.success('更新授信额度成功')
          this.$emit('success')
        } catch (error) {
          const message = error.response?.data?.msg || '更新授信额度失败'
          this.$message.error(message)
        } finally {
          this.submitting = false
        }
      })
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.$refs.creditForm.resetFields()
    },

    // 格式化金额
    formatMoney(amount) {
      if (!amount) return '¥0.00'
      return `¥${Number(amount).toFixed(2)}`
    },

    // 获取可用授信额度
    getAvailableCredit() {
      const creditLimit = Number(this.form.creditLimit) || 0
      const consumedAmount = Number((this.employeeData && this.employeeData.consumedAmount)) || 0
      return Math.max(0, creditLimit - consumedAmount)
    }
  }
}
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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
</style> 