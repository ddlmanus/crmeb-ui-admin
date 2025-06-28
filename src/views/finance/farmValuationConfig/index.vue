<template>
  <div class="app-container farm-valuation-config-page">
    <!-- 搜索条件 -->
    <div class="filter-container">
      <el-input
        v-model="searchForm.keywords"
        placeholder="请输入养殖品种或编码"
        clearable
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="searchForm.status"
        placeholder="状态"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd HH:mm:ss"
        style="width: 300px"
        class="filter-item"
        @change="handleDateChange"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        添加配置
      </el-button>
    </div>

    <!-- 表格数据 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
        label="ID"
        prop="id"
        align="center"
        width="80"
      />
      <el-table-column
        label="养殖场名称"
        prop="farmName"
        align="center"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column
        label="养殖品种"
        prop="breedingName"
        align="center"
        min-width="120"
      />
      <el-table-column
        label="品种类型"
        prop="breedingType"
        align="center"
        min-width="120"
      />
      <el-table-column
        label="品种编码"
        prop="breedingCode"
        align="center"
        min-width="120"
      />
      <el-table-column
        label="单位"
        prop="unitName"
        align="center"
        min-width="80"
      />
      <el-table-column
        label="单价（元）"
        prop="unitPrice"
        align="center"
        min-width="120"
      >
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.unitPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        prop="status"
        align="center"
        min-width="80"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        min-width="160"
      >
        <template slot-scope="{row}">
          <span>{{ formatTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button type="text" size="small" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button
            type="text"
            size="small"
            :style="{ color: row.status === 1 ? '#e6a23c' : '#67c23a' }"
            @click="handleStatusChange(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button
            type="text"
            size="small"
            style="color: #f56c6c;"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="listQuery.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="listQuery.limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 500px; margin-left:50px;"
      >
        <el-form-item label="养殖场" prop="farmCode">
          <el-select 
            v-model="temp.farmCode" 
            placeholder="请选择养殖场" 
            style="width: 100%"
            filterable
            :loading="farmsLoading"
            @change="handleFarmChange"
          >
            <el-option
              v-for="item in farms"
              :key="item.id"
              :label="item.farmName"
              :value="item.farmCode"
            >
              <span style="float: left">{{ item.farmName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.farmCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="养殖品种" prop="breedingName">
          <el-select 
            v-model="temp.breedingName" 
            placeholder="请选择养殖品种" 
            style="width: 100%"
            filterable
            :loading="breedingProductsLoading"
            :disabled="!temp.farmCode"
            @change="handleBreedingNameChange"
          >
            <el-option
              v-for="item in breedingProducts"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            >
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.splitSpecies }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="品种类型" prop="breedingType">
          <el-select 
            v-model="temp.breedingType" 
            placeholder="请选择品种类型" 
            style="width: 100%"
            filterable
            :loading="breedTypesLoading"
            :disabled="!temp.breedingName"
          >
            <el-option
              v-for="item in breedTypes"
              :key="item.id"
              :label="item.breedType"
              :value="item.breedType"
            >
              <span style="float: left">{{ item.breedType }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">存栏: {{ item.stockQuantity || 0 }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="品种编码" prop="breedingCode">
          <el-input v-model="temp.breedingCode" placeholder="请输入品种编码" />
        </el-form-item>
        <el-form-item label="单位名称" prop="unitName">
          <el-select 
            v-model="temp.unitName" 
            placeholder="请选择单位名称" 
            style="width: 100%"
            filterable
            :loading="unitOptionsLoading"
          >
            <el-option
              v-for="item in unitOptions"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictLabel"
            >
              <span style="float: left">{{ item.dictLabel }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.remark }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单价（元）" prop="unitPrice">
          <el-input-number
            v-model="temp.unitPrice"
            :precision="2"
            :step="100"
            :min="0.01"
            placeholder="请输入单价"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="temp.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  farmValuationConfigPage,
  farmValuationConfigSave,
  farmValuationConfigUpdate,
  farmValuationConfigDelete,
  farmValuationConfigUpdateStatus,
  getBreedingProducts,
  getBreedTypesByName,
  getFarms,
  getBreedingProductsByFarm
} from '@/api/farmValuationConfig'
import { dictDataApi } from '@/api/systemDict'
import { Message } from 'element-ui'

export default {
  name: 'FarmValuationConfig',
  filters: {
    moneyFilter(value) {
      if (!value) return '0.00'
      return Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    parseTime(time, pattern) {
      if (!time) return ''
      const date = new Date(time)
      if (isNaN(date.getTime())) return ''
      
      const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds()
      }
      
      return format.replace(/{([ymdhi])+}/g, (result, key) => {
        const value = formatObj[key]
        return value.toString().padStart(2, '0')
      })
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      searchForm: {
        keywords: '',
        status: null
      },
      dateRange: null,
      temp: {
        id: null,
        farmId: null,
        farmName: '',
        farmCode: '',
        breedingName: '',
        breedingType: '',
        breedingCode: '',
        unitName: '',
        unitPrice: null,
        remark: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑配置',
        create: '添加配置'
      },
      rules: {
        farmCode: [{ required: true, message: '养殖场必填', trigger: 'change' }],
        breedingName: [{ required: true, message: '养殖品种必填', trigger: 'change' }],
        breedingType: [{ required: true, message: '品种类型必填', trigger: 'change' }],
        unitName: [{ required: true, message: '单位名称必填', trigger: 'blur' }],
        unitPrice: [
          { required: true, message: '单价必填', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '单价必须大于0.01', trigger: 'blur' }
        ]
      },
      unitOptions: [],
      unitOptionsLoading: false,
      farms: [],
      farmsLoading: false,
      breedingProducts: [],
      breedingProductsLoading: false,
      breedTypes: [],
      breedTypesLoading: false
    }
  },
  created() {
    this.getList()
    this.getUnitOptions()
    this.getFarms()
  },
  methods: {
    getList() {
      this.listLoading = true
      const params = {
        ...this.listQuery,
        ...this.searchForm
      }
      farmValuationConfigPage(params).then(response => {
        console.log('养殖场评估配置API原始响应:', response)
        
        // 确保response存在
        if (!response) {
          console.warn('API响应为空')
          this.list = []
          this.total = 0
          this.listLoading = false
          return
        }
        
        // 响应拦截器已处理data层级，直接从response获取
        this.list = response.list || response.records || []
        this.total = response.total || 0
        
        // 如果list仍为空，尝试其他可能的结构
        if (this.list.length === 0 && response.data) {
          this.list = response.data.list || response.data.records || []
          this.total = response.data.total || 0
        }
        
        console.log('处理后的列表数据 - 数量:', this.list.length)
        console.log('处理后的列表数据:', this.list)
        console.log('总数:', this.total)
        
        this.listLoading = false
      }).catch(error => {
        console.error('获取养殖场评估配置列表失败:', error)
        Message.error('获取数据失败，请稍后重试')
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDateChange(value) {
      if (value && value.length === 2) {
        this.searchForm.dateLimit = `${value[0]} - ${value[1]}`
      } else {
        this.searchForm.dateLimit = ''
      }
    },
    resetTemp() {
      this.temp = {
        id: null,
        farmId: null,
        farmName: '',
        farmCode: '',
        breedingName: '',
        breedingType: '',
        breedingCode: '',
        unitName: '',
        unitPrice: null,
        remark: ''
      }
      // 重置级联选择数据
      this.breedingProducts = []
      this.breedTypes = []
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          farmValuationConfigSave(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      
      // 如果有养殖场编码，加载品种列表
      if (this.temp.farmCode) {
        this.getBreedingProductsByFarm(this.temp.farmCode)
      }
      
      // 如果有品种名称，加载品种类型
      if (this.temp.breedingName) {
        this.loadBreedTypes(this.temp.breedingName)
      }
      
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          farmValuationConfigUpdate(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该配置, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        farmValuationConfigDelete(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    },
    handleStatusChange(row) {
      const newStatus = row.status === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'
      
      this.$confirm(`确定要${statusText}该配置吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        farmValuationConfigUpdateStatus(row.id, newStatus).then(() => {
          row.status = newStatus
          this.$notify({
            title: '成功',
            message: `${statusText}成功`,
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.listQuery.page = 1
      this.getList()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    
    // 获取单位字典数据
    async getUnitOptions() {
      this.unitOptionsLoading = true
      try {
        const response = await dictDataApi.getByDictType('livestock_unit')
        console.log('单位字典数据:', response)
        this.unitOptions = response || []
      } catch (error) {
        console.error('获取单位字典数据失败:', error)
        Message.error('获取单位选项失败')
        this.unitOptions = []
      } finally {
        this.unitOptionsLoading = false
      }
    },
    
    // 获取养殖场列表
    async getFarms() {
      this.farmsLoading = true
      try {
        const response = await getFarms()
        console.log('养殖场数据:', response)
        this.farms = response || []
      } catch (error) {
        console.error('获取养殖场失败:', error)
        Message.error('获取养殖场失败')
        this.farms = []
      } finally {
        this.farmsLoading = false
      }
    },
    
    // 获取养殖品种列表（根据养殖场）
    async getBreedingProductsByFarm(farmCode) {
      if (!farmCode) {
        this.breedingProducts = []
        return
      }
      this.breedingProductsLoading = true
      try {
        const response = await getBreedingProductsByFarm(farmCode)
        console.log('养殖品种数据:', response)
        this.breedingProducts = response || []
      } catch (error) {
        console.error('获取养殖品种失败:', error)
        Message.error('获取养殖品种失败')
        this.breedingProducts = []
      } finally {
        this.breedingProductsLoading = false
      }
    },
    
    // 养殖场改变事件
    handleFarmChange(farmCode) {
      // 重置品种相关数据
      this.temp.breedingName = ''
      this.temp.breedingType = ''
      this.breedingProducts = []
      this.breedTypes = []
      
      if (farmCode) {
        // 设置养殖场名称
        const selectedFarm = this.farms.find(farm => farm.farmCode === farmCode)
        if (selectedFarm) {
          this.temp.farmId = selectedFarm.id
          this.temp.farmName = selectedFarm.farmName
        }
        
        // 加载该养殖场的品种列表
        this.getBreedingProductsByFarm(farmCode)
      }
    },
    
    // 品种名称改变事件
    handleBreedingNameChange(breedName) {
      // 重置品种类型
      this.temp.breedingType = ''
      this.breedTypes = []
      
      if (breedName) {
        this.loadBreedTypes(breedName)
      }
    },
    
    // 加载品种类型
    async loadBreedTypes(breedName) {
      this.breedTypesLoading = true
      try {
        const response = await getBreedTypesByName(breedName)
        console.log('品种类型数据:', response)
        this.breedTypes = response || []
      } catch (error) {
        console.error('获取品种类型失败:', error)
        Message.error('获取品种类型失败')
        this.breedTypes = []
      } finally {
        this.breedTypesLoading = false
      }
    },
    
    formatMoney(value) {
      if (!value) return '0.00'
      return Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      if (isNaN(date.getTime())) return ''
      
      const y = date.getFullYear()
      const m = (date.getMonth() + 1).toString().padStart(2, '0')
      const d = date.getDate().toString().padStart(2, '0')
      const h = date.getHours().toString().padStart(2, '0')
      const i = date.getMinutes().toString().padStart(2, '0')
      
      return `${y}-${m}-${d} ${h}:${i}`
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding: 10px 0;
}

.filter-item {
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;
  margin-right: 10px;
}

.pagination-container {
  padding: 20px;
  text-align: right;
  background: #fff;
}
</style> 