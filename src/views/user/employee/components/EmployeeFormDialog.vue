<template>
  <el-dialog
    :title="isEdit ? '编辑员工' : '新增员工'"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="employeeForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      size="small"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="员工姓名" prop="name">
            <el-input v-model.trim="form.name" placeholder="请输入员工姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="员工工号" prop="employeeNo">
            <el-input v-model.trim="form.employeeNo" placeholder="请输入员工工号" :disabled="isEdit" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model.trim="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="员工账户" prop="account">
            <el-input v-model.trim="form.account" placeholder="请输入员工账户" :disabled="isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="登录密码" prop="password" :rules="passwordRules">
            <el-input 
              v-model.trim="form.password" 
              type="password" 
              :placeholder="isEdit ? '不修改请留空' : '请输入登录密码'" 
              show-password
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model.trim="form.idCard" placeholder="请输入身份证号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
              <el-option value="0" label="未知"></el-option>
              <el-option value="1" label="男"></el-option>
              <el-option value="2" label="女"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属养殖机构" prop="farmInstitutionId">
            <el-select 
              v-model="form.farmInstitutionId" 
              placeholder="请选择所属养殖机构" 
              style="width: 100%"
              filterable
              clearable
            >
              <el-option
                v-for="item in farmInstitutions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="员工状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择员工状态" style="width: 100%">
              <el-option :value="1" label="在职"></el-option>
              <el-option :value="2" label="试用期"></el-option>
              <el-option :value="0" label="离职"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 养殖组织信息 -->
      <el-divider content-position="left">养殖组织信息</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="养殖类型" prop="farmType">
            <el-select v-model="form.farmType" placeholder="请选择养殖类型" style="width: 100%">
              <el-option :value="0" label="游客"></el-option>
              <el-option :value="1" label="种植户/种植企业"></el-option>
              <el-option :value="2" label="合作社"></el-option>
              <el-option :value="3" label="经纪人"></el-option>
              <el-option :value="4" label="供应商"></el-option>
              <el-option :value="5" label="平台"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="企业名称" prop="companyName">
            <el-input v-model.trim="form.companyName" placeholder="请输入企业名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="responsiblePerson">
            <el-input v-model.trim="form.responsiblePerson" placeholder="请输入负责人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="养殖品种" prop="breedingVariety">
            <el-select
              v-model="form.breedingVariety"
              placeholder="请选择养殖品种"
              style="width: 100%"
              filterable
              allow-create
            >
              <el-option
                v-for="item in breedingProducts"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="存栏量(头)" prop="stockQuantity">
            <el-input-number
              v-model="form.stockQuantity"
              placeholder="请输入存栏量"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="授信额度(元)" prop="creditLimit">
            <el-input-number
              v-model="form.creditLimit"
              placeholder="请输入授信额度"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="已消费金额(元)" prop="consumedAmount">
            <el-input-number
              v-model="form.consumedAmount"
              placeholder="请输入已消费金额"
              :min="0"
              :precision="2"
              style="width: 100%"
              :disabled="!isEdit"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="地址" prop="address">
        <el-input v-model.trim="form.address" placeholder="请输入地址" />
      </el-form-item>

      <el-form-item label="个人简介" prop="biography">
        <el-input
          v-model.trim="form.biography"
          type="textarea"
          :rows="3"
          placeholder="请输入个人简介"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model.trim="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ isEdit ? '更新' : '新增' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { employeeCreateApi, employeeUpdateApi, getBreedingProductsApi, getFarmInstitutionsApi } from '@/api/employee'

export default {
  name: 'EmployeeFormDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    employeeData: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      submitting: false,
      breedingProducts: [],
      farmInstitutions: [],
      form: {
        name: '',
        employeeNo: '',
        phone: '',
        email: '',
        account: '',
        password: '',
        idCard: '',
        gender: 1,
        farmInstitutionId: '',
        status: 1,
        farmType: 0,
        companyName: '',
        responsiblePerson: '',
        breedingVariety: '',
        stockQuantity: 0,
        creditCoefficient: 0,
        creditLimit: 0,
        consumedAmount: 0,
        address: '',
        biography: '',
        remark: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入员工姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '员工姓名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        employeeNo: [
          { required: true, message: '请输入员工工号', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9]{4,20}$/, message: '员工工号由4-20位字母数字组成', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        account: [
          { required: true, message: '请输入员工账户', trigger: 'blur' },
          { min: 4, max: 20, message: '员工账户长度在 4 到 20 个字符', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9_]+$/, message: '员工账户只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        idCard: [
          { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择员工状态', trigger: 'change' }
        ],
        farmType: [
          { required: true, message: '请选择养殖类型', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 动态密码验证规则
    passwordRules() {
      if (this.isEdit) {
        // 编辑时密码为可选
        return [
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      } else {
        // 新增时密码为必填
        return [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initForm()
        this.getBreedingProducts()
        this.getFarmInstitutions()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 初始化表单
    initForm() {
      if (this.isEdit && this.employeeData) {
        this.form = { ...this.employeeData }
      } else {
        this.form = {
          name: '',
          employeeNo: '',
          phone: '',
          email: '',
          account: '',
          password: '',
          idCard: '',
          gender: 1,
          farmInstitutionId: '',
          status: 1,
          farmType: 0,
          companyName: '',
          responsiblePerson: '',
          breedingVariety: '',
          stockQuantity: 0,
          creditCoefficient: 0,
          creditLimit: 0,
          consumedAmount: 0,
          address: '',
          biography: '',
          remark: ''
        }
      }
    },

    // 获取养殖品种列表
    async getBreedingProducts() {
      try {
        const response = await getBreedingProductsApi()
        console.log('养殖品种API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let data = []
        if (response.code === 200 && response.data) {
          data = response.data
        } else if (response.data) {
          data = response.data
        } else if (Array.isArray(response)) {
          data = response
        }
        
        console.log('提取的原始养殖品种data:', data)
        
        // 转换数据格式为前端所需的格式，避免响应式包装
        if (Array.isArray(data)) {
          this.breedingProducts = data.map(item => ({
            value: String(item.name || ''),  // 使用名称作为值
            label: String(item.name || '')   // 使用名称作为标签
          }))
        } else {
          this.breedingProducts = []
        }
        
        console.log('处理后的养殖品种数据长度:', this.breedingProducts.length)
        console.log('处理后的养殖品种数据样例:', this.breedingProducts.slice(0, 3))
      } catch (error) {
        console.error('获取养殖品种失败', error)
        this.breedingProducts = []
      }
    },

    // 获取养殖机构列表
    async getFarmInstitutions() {
      try {
        const response = await getFarmInstitutionsApi()
        console.log('养殖机构API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let data = []
        if (response.code === 200 && response.data) {
          data = response.data
        } else if (response.data) {
          data = response.data
        } else if (Array.isArray(response)) {
          data = response
        }
        
        console.log('提取的原始养殖机构data:', data)
        
        // 重新构造数据避免响应式包装，确保格式正确 {id, name}
        if (Array.isArray(data)) {
          this.farmInstitutions = data.map(item => ({
            id: item.id,
            name: String(item.name || '')
          }))
        } else {
          this.farmInstitutions = []
        }
        
        console.log('处理后的养殖机构数据长度:', this.farmInstitutions.length)
        console.log('处理后的养殖机构数据样例:', this.farmInstitutions.slice(0, 3))
      } catch (error) {
        console.error('获取养殖机构失败', error)
        this.farmInstitutions = []
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.employeeForm.validate(async (valid) => {
        if (!valid) return

        this.submitting = true
        try {
          const submitData = { ...this.form }
          
          // 编辑时如果密码为空，则不传递密码字段
          if (this.isEdit && !submitData.password) {
            delete submitData.password
          }
          
          if (this.isEdit) {
            await employeeUpdateApi(submitData)
            this.$message.success('更新员工成功')
          } else {
            await employeeCreateApi(submitData)
            this.$message.success('新增员工成功')
          }
          this.$emit('success')
        } catch (error) {
          const action = this.isEdit ? '更新' : '新增'
          const message = error.response?.data?.msg || `${action}员工失败`
          this.$message.error(message)
        } finally {
          this.submitting = false
        }
      })
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.$refs.employeeForm.resetFields()
    }
  }
}
</script>

<style scoped>
.el-divider {
  margin: 20px 0;
}
</style> 