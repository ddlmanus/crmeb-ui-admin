<template>
  <div class="divBox relative">
    <!-- 搜索条件 -->
    <el-card
      :bordered="false"
      shadow="never"
      class="ivu-mt"
      :body-style="{ padding: 0 }"
      v-hasPermi="['platform:employee:page']"
    >
      <div class="padding-add">
        <el-form
          ref="searchForm"
          :model="searchForm"
          label-width="80px"
          label-position="right"
          @submit.native.prevent
          inline
        >
          <div class="acea-row search-form" v-if="!collapse">
            <div class="search-form-box">
              <el-form-item label="关键词：" label-for="keywords">
                <el-input
                  v-model.trim="searchForm.keywords"
                  placeholder="员工姓名/手机号/工号"
                  size="small"
                  clearable
                  class="selWidth"
                />
              </el-form-item>
              <el-form-item label="员工状态：">
                <el-select v-model="searchForm.status" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="在职"></el-option>
                  <el-option value="2" label="试用期"></el-option>
                  <el-option value="0" label="离职"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="养殖类型：">
                <el-select v-model="searchForm.farmType" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="0" label="游客"></el-option>
                  <el-option value="1" label="种植户/种植企业"></el-option>
                  <el-option value="2" label="合作社"></el-option>
                  <el-option value="3" label="经纪人"></el-option>
                  <el-option value="4" label="供应商"></el-option>
                  <el-option value="5" label="平台"></el-option>
                </el-select>
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" size="small" @click="searchEmployees">搜索</el-button>
              <el-button size="small" @click="resetSearch" class="ResetSearch">重置</el-button>
              <a class="ivu-ml-8 font12 ml10" @click="collapse = !collapse">
                <template v-if="!collapse"> 展开 <i class="el-icon-arrow-down" /> </template>
                <template v-else> 收起 <i class="el-icon-arrow-up" /> </template>
              </a>
            </el-form-item>
          </div>
          <div v-if="collapse" class="acea-row search-form">
            <div class="search-form-box">
              <el-form-item label="关键词：" label-for="keywords">
                <el-input
                  v-model.trim="searchForm.keywords"
                  placeholder="员工姓名/手机号/工号"
                  size="small"
                  clearable
                  class="selWidth"
                />
              </el-form-item>
              <el-form-item label="员工状态：">
                <el-select v-model="searchForm.status" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="1" label="在职"></el-option>
                  <el-option value="2" label="试用期"></el-option>
                  <el-option value="0" label="离职"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="养殖类型：">
                <el-select v-model="searchForm.farmType" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="0" label="游客"></el-option>
                  <el-option value="1" label="种植户/种植企业"></el-option>
                  <el-option value="2" label="合作社"></el-option>
                  <el-option value="3" label="经纪人"></el-option>
                  <el-option value="4" label="供应商"></el-option>
                  <el-option value="5" label="平台"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="养殖机构：">
                <el-select 
                  v-model="searchForm.farmInstitutionId" 
                  placeholder="请选择养殖机构" 
                  size="small" 
                  class="selWidth" 
                  clearable
                  filterable
                >
                  <el-option value="" label="全部"></el-option>
                  <el-option
                    v-for="item in farmInstitutions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="性别：">
                <el-select v-model="searchForm.gender" placeholder="请选择" size="small" class="selWidth" clearable>
                  <el-option value="" label="全部"></el-option>
                  <el-option value="0" label="未知"></el-option>
                  <el-option value="1" label="男"></el-option>
                  <el-option value="2" label="女"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="企业名称：">
                <el-input
                  v-model.trim="searchForm.companyName"
                  placeholder="请输入企业名称"
                  size="small"
                  clearable
                  class="selWidth"
                />
              </el-form-item>
              <el-form-item label="养殖品种：">
                <el-input
                  v-model.trim="searchForm.breedingVariety"
                  placeholder="请输入养殖品种"
                  size="small"
                  clearable
                  class="selWidth"
                />
              </el-form-item>
            </div>
            <el-form-item class="search-form-sub">
              <el-button type="primary" size="small" @click="searchEmployees">搜索</el-button>
              <el-button class="ResetSearch" size="small" @click="resetSearch">重置</el-button>
              <a class="ivu-ml-8 font12 ml10" @click="collapse = !collapse">
                <template v-if="!collapse"> 展开 <i class="el-icon-arrow-down" /> </template>
                <template v-else> 收起 <i class="el-icon-arrow-up" /> </template>
              </a>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="box-card mt14" :body-style="{ padding: '20px' }" shadow="never" :bordered="false">
      <div class="acea-row row-between-wrapper" style="margin-bottom: 20px;">
        <div>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleAddEmployee"
            v-hasPermi="['platform:employee:create']"
            icon="el-icon-plus"
          >
            新增员工
          </el-button>
        </div>
        <div>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleBatchDelete"
            :disabled="!selectedEmployees.length"
            v-hasPermi="['platform:employee:delete']"
            icon="el-icon-delete"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        :data="employeeList"
        size="small"
        @selection-change="handleSelectionChange"
        highlight-current-row
        class="mt20"
        empty-text="暂无员工数据"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="employeeNo" label="员工工号" width="120" align="center" />
        <el-table-column prop="name" label="员工姓名" width="100" align="center" />
        <el-table-column prop="phone" label="手机号" width="130" align="center" />
        <el-table-column prop="farmName" label="养殖场名称" width="150" align="center">
          <template slot-scope="scope">
            {{ scope.row.farmName || '未分配' }}
          </template>
        </el-table-column>
        <el-table-column prop="breedingVarietyNames" label="养殖品种" width="150" align="center">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.breedingVarietyNames || '暂无'" placement="top" :disabled="!(scope.row.breedingVarietyNames && scope.row.breedingVarietyNames.length > 15)">
              <span>{{ (scope.row.breedingVarietyNames && scope.row.breedingVarietyNames.length > 15) ? (scope.row.breedingVarietyNames.substring(0, 15) + '...') : (scope.row.breedingVarietyNames || '暂无') }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="breedingVarietyTypes" label="品种类型" width="150" align="center">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.breedingVarietyTypes || '暂无'" placement="top" :disabled="!(scope.row.breedingVarietyTypes && scope.row.breedingVarietyTypes.length > 15)">
              <span>{{ (scope.row.breedingVarietyTypes && scope.row.breedingVarietyTypes.length > 15) ? (scope.row.breedingVarietyTypes.substring(0, 15) + '...') : (scope.row.breedingVarietyTypes || '暂无') }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="totalStockQuantity" label="总存栏量" width="100" align="center">
          <template slot-scope="scope">
            <span class="text-info">{{ scope.row.totalStockQuantity || 0 }}头</span>
          </template>
        </el-table-column>
        <el-table-column prop="assessmentAmount" label="评估金额" width="120" align="center">
          <template slot-scope="scope">
            <span class="text-warning">{{ formatMoney(scope.row.assessmentAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="creditCoefficient" label="授信系数" width="100" align="center">
          <template slot-scope="scope">
            <span class="text-primary">{{ formatPercent(scope.row.creditCoefficient) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="creditLimit" label="授信额度" width="120" align="center">
          <template slot-scope="scope">
            <span class="text-success">{{ formatMoney(scope.row.creditLimit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="consumedAmount" label="已消费金额" width="120" align="center">
          <template slot-scope="scope">
            <span class="text-danger">{{ formatMoney(scope.row.consumedAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="statusText" label="员工状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag 
              :type="getStatusTagType(scope.row.status)" 
              size="small"
            >
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button 
              type="text" 
              size="small" 
              @click="handleViewEmployee(scope.row)"
              v-hasPermi="['platform:employee:detail']"
            >
              查看
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="handleEditEmployee(scope.row)"
              v-hasPermi="['platform:employee:update']"
            >
              编辑
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="handleEditCredit(scope.row)"
              v-hasPermi="['platform:employee:update']"
            >
              授信
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="handleDeleteEmployee(scope.row)"
              v-hasPermi="['platform:employee:delete']"
              class="text-danger"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="block">
        <el-pagination
          background
          :page-sizes="[20, 40, 60, 80]"
          :page-size="searchForm.limit"
          :current-page="searchForm.page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑员工对话框 -->
    <employee-form-dialog 
      :visible.sync="formDialogVisible"
      :employee-data="currentEmployee"
      :is-edit="isEdit"
      @success="handleFormSuccess"
    />

    <!-- 员工详情对话框 -->
    <employee-detail-dialog 
      :visible.sync="detailDialogVisible"
      :employee-id="currentEmployeeId"
    />

    <!-- 授信额度编辑对话框 -->
    <credit-edit-dialog 
      :visible.sync="creditDialogVisible"
      :employee-data="currentEmployee"
      @success="handleCreditSuccess"
    />
  </div>
</template>

<script>
import { employeePageApi, employeeDeleteApi, employeeBatchDeleteApi, getFarmInstitutionsApi } from '@/api/employee'
import EmployeeFormDialog from './components/EmployeeFormDialog'
import EmployeeDetailDialog from './components/EmployeeDetailDialog'
import CreditEditDialog from './components/CreditEditDialog'

export default {
  name: 'EmployeeList',
  components: {
    EmployeeFormDialog,
    EmployeeDetailDialog,
    CreditEditDialog
  },
  data() {
    return {
      collapse: false,
      loading: false,
      farmInstitutions: [],
      searchForm: {
        page: 1,
        limit: 20,
        keywords: '',
        status: '',
        farmType: '',
        farmInstitutionId: '',
        gender: '',
        companyName: '',
        breedingVariety: ''
      },
      employeeList: [],
      total: 0,
      selectedEmployees: [],
      formDialogVisible: false,
      detailDialogVisible: false,
      creditDialogVisible: false,
      currentEmployee: null,
      currentEmployeeId: null,
      isEdit: false
    }
  },
  mounted() {
    this.getEmployeeList()
    this.getFarmInstitutions()
  },
  methods: {
    // 获取员工列表
    async getEmployeeList() {
      this.loading = true
      try {
        const response = await employeePageApi(this.searchForm)
        console.log('员工列表API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let pageData = {}
        if (response.code === 200 && response.data) {
          pageData = response.data
        } else if (response.data) {
          pageData = response.data
        } else if (response) {
          // 如果直接返回分页数据（没有code包装）
          pageData = response
        }
        
        // 确保安全提取数据并避免响应式包装
        const records = pageData.records || []
        const total = pageData.total || 0
        
        this.employeeList = Array.isArray(records) ? [...records] : []
        this.total = Number(total)
        
        console.log('提取的records:', records)
        console.log('提取的total:', total)
        console.log('最终员工列表数据:', this.employeeList)
        console.log('最终总数据量:', this.total)
      } catch (error) {
        console.error('获取员工列表失败', error)
        this.employeeList = []
        this.total = 0
        
        // 记录错误详情用于调试（生产环境可移除）
        console.log('Error details:', {
          hasResponse: !!error.response,
          status: error.response?.status,
          message: error.message,
          code: error.code
        })
        
        // 更精确的错误判断
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          this.$message.error('网络连接失败，请检查网络')
        } else if (error.response) {
          // 有响应，根据状态码处理
          if (error.response.status >= 500) {
            this.$message.error('服务器错误，请稍后重试')
          } else {
            // 对于4xx错误，响应拦截器已经显示了错误信息，这里不再重复显示
            console.log('Business error handled by response interceptor')
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应
          this.$message.error('服务器无响应，请稍后重试')
        } else {
          // 其他错误（如代码逻辑错误等）
          console.error('Unexpected error:', error)
          // 对于代码逻辑错误，不显示错误提示给用户
        }
      } finally {
        this.loading = false
      }
    },

    // 获取养殖机构列表
    async getFarmInstitutions() {
      try {
        const response = await getFarmInstitutionsApi()
        console.log('主页面养殖机构API响应:', response)
        
        // 根据实际的API响应结构来处理数据
        let data = []
        if (response.code === 200 && response.data) {
          data = response.data
        } else if (response.data) {
          data = response.data
        } else if (Array.isArray(response)) {
          // 如果直接返回数组
          data = response
        }
        
        console.log('提取的原始data:', data)
        
        // 使用展开运算符而不是JSON深拷贝，更简洁且避免响应式包装
        if (Array.isArray(data)) {
          this.farmInstitutions = data.map(item => ({
            id: item.id,
            name: item.name
          }))
        } else {
          this.farmInstitutions = []
        }
        
        console.log('主页面处理后的养殖机构数据长度:', this.farmInstitutions.length)
        console.log('主页面处理后的养殖机构数据样例:', this.farmInstitutions.slice(0, 3))
      } catch (error) {
        console.error('获取养殖机构失败', error)
        this.farmInstitutions = []
      }
    },

    // 搜索员工
    searchEmployees() {
      this.searchForm.page = 1
      this.getEmployeeList()
    },

    // 重置搜索
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.searchForm = {
        page: 1,
        limit: 20,
        keywords: '',
        status: '',
        farmType: '',
        farmInstitutionId: '',
        gender: '',
        companyName: '',
        breedingVariety: ''
      }
      this.getEmployeeList()
    },

    // 新增员工
    handleAddEmployee() {
      this.currentEmployee = null
      this.isEdit = false
      this.formDialogVisible = true
    },

    // 编辑员工
    handleEditEmployee(row) {
      this.currentEmployee = { ...row }
      this.isEdit = true
      this.formDialogVisible = true
    },

    // 查看员工详情
    handleViewEmployee(row) {
      this.currentEmployeeId = row.id
      this.detailDialogVisible = true
    },

    // 编辑授信额度
    handleEditCredit(row) {
      this.currentEmployee = { ...row }
      this.creditDialogVisible = true
    },

    // 删除员工
    handleDeleteEmployee(row) {
      this.$confirm('确定要删除该员工吗？删除后将无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await employeeDeleteApi(row.id)
          this.$message.success('删除成功')
          this.getEmployeeList()
        } catch (error) {
          const message = error.response?.data?.msg || '删除失败'
          this.$message.error(message)
        }
      })
    },

    // 批量删除
    handleBatchDelete() {
      if (!this.selectedEmployees.length) {
        this.$message.warning('请选择要删除的员工')
        return
      }
      
      this.$confirm(`确定要删除选中的 ${this.selectedEmployees.length} 名员工吗？删除后将无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedEmployees.map(item => item.id).join(',')
          await employeeBatchDeleteApi(ids)
          this.$message.success('批量删除成功')
          this.getEmployeeList()
        } catch (error) {
          const message = error.response?.data?.msg || '批量删除失败'
          this.$message.error(message)
        }
      })
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedEmployees = selection
    },

    // 表单提交成功
    handleFormSuccess() {
      this.formDialogVisible = false
      this.getEmployeeList()
    },

    // 授信编辑成功
    handleCreditSuccess() {
      this.creditDialogVisible = false
      this.getEmployeeList()
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

    // 分页大小改变
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.searchForm.page = 1
      this.getEmployeeList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getEmployeeList()
    }
  }
}
</script>

<style scoped>
.divBox {
  background: #f8f8f8;
  padding: 20px;
  min-height: calc(100vh - 84px);
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
}

.search-form-box {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.search-form-sub {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.selWidth {
  width: 200px;
}

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

.mt14 {
  margin-top: 14px;
}

.mt20 {
  margin-top: 20px;
}

.block {
  margin-top: 20px;
  text-align: right;
}

.acea-row {
  display: flex;
  align-items: center;
}

.row-between-wrapper {
  justify-content: space-between;
}

.padding-add {
  padding: 0 20px;
}

.ResetSearch {
  margin-left: 10px;
}

.font12 {
  font-size: 12px;
}

.ml10 {
  margin-left: 10px;
}

.ivu-ml-8 {
  margin-left: 8px;
}

.ivu-mt {
  margin-top: 20px;
}

.box-card {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  overflow: hidden;
  color: #303133;
}
</style> 