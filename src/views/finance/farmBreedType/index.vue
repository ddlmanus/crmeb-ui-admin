<template>
  <div class="app-container farm-breed-type-page">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keywords"
            placeholder="养殖场名称、品种名称、品种类型"
            style="width: 250px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="养殖场名称">
          <el-input
            v-model="searchForm.farmName"
            placeholder="养殖场名称"
            style="width: 150px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="品种名称">
          <el-input
            v-model="searchForm.breedName"
            placeholder="品种名称"
            style="width: 120px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateLimit"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="table-tools">
      <el-button v-hasPermi="['admin:finance:farmBreedType:add']" type="primary" icon="el-icon-plus" @click="handleAdd">新增品种类型</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      border
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="farmCode" label="养殖场编码" min-width="140" sortable="custom" />
      <el-table-column prop="farmName" label="养殖场名称" min-width="150" sortable="custom" />
      <el-table-column prop="breedName" label="品种名称" min-width="120" sortable="custom" />
      <el-table-column prop="breedType" label="品种类型" min-width="120" />
      <el-table-column prop="growthStage" label="生长阶段" min-width="120" />
      <el-table-column prop="stockQuantity" label="存栏量" min-width="100" sortable="custom">
        <template slot-scope="scope">
          <span class="stock-quantity">{{ scope.row.stockQuantity || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" sortable="custom">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="searchForm.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="searchForm.limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="dataForm"
        :rules="dataRules"
        label-width="100px"
      >
        <el-form-item label="养殖场" prop="farmCode">
          <el-select
            v-model="dataForm.farmCode"
            placeholder="请选择养殖场"
            style="width: 100%;"
            filterable
            clearable
            @change="handleFarmChange"
          >
            <el-option
              v-for="farm in farmInstitutionList"
              :key="farm.farmCode"
              :label="`${farm.farmName} (${farm.farmCode})`"
              :value="farm.farmCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="养殖场编码" prop="farmCode">
          <el-input v-model="dataForm.farmCode" placeholder="自动填充" disabled />
        </el-form-item>
        <el-form-item label="养殖场名称" prop="farmName">
          <el-input v-model="dataForm.farmName" placeholder="自动填充" disabled />
        </el-form-item>
        <el-form-item label="品种名称" prop="breedName">
          <el-select 
            v-model="dataForm.breedName" 
            placeholder="请选择品种名称" 
            style="width: 100%;"
            filterable
            @change="handleBreedChange"
          >
            <el-option
              v-for="item in breedingProductList"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品种类型" prop="breedType">
          <el-input v-model="dataForm.breedType" placeholder="请输入品种类型" />
        </el-form-item>
        <el-form-item label="生长阶段" prop="growthStage">
          <el-input v-model="dataForm.growthStage" placeholder="请输入生长阶段" />
        </el-form-item>
        <el-form-item label="存栏量" prop="stockQuantity">
          <el-input-number
            v-model="dataForm.stockQuantity"
            :min="0"
            :precision="0"
            placeholder="请输入存栏量"
            style="width: 100%;"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">
          确定
        </el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { pageListApi, addApi, editApi, deleteApi } from '@/api/farmBreedType'
import { farmInstitutionApi } from '@/api/farmInstitution'
import { getOptionsApi as getBreedingProductOptionsApi } from '@/api/breedingProduct'

export default {
  name: 'FarmBreedType',
  data() {
    return {
      // 搜索表单
      searchForm: {
        keywords: '',
        farmName: '',
        breedName: '',
        dateLimit: null,
        page: 1,
        limit: 10
      },
      // 表格数据
      tableData: [],
      tableLoading: false,
      total: 0,
      // 对话框
      dialogVisible: false,
      dialogTitle: '',
      // 养殖机构列表
      farmInstitutionList: [],
      // 品种列表
      breedingProductList: [],
      dataForm: {
        id: '',
        farmCode: '',
        farmName: '',
        farmId: '',
        breedName: '',
        breedId: '',
        breedType: '',
        stockQuantity: 0,
        growthStage: ''
      },
      // 表单验证规则
      dataRules: {
        farmCode: [
          { required: true, message: '请选择养殖场', trigger: 'change' }
        ],
        breedName: [
          { required: true, message: '品种名称不能为空', trigger: 'blur' }
        ],
        breedType: [
          { required: true, message: '品种类型不能为空', trigger: 'blur' }
        ],
        growthStage: [
          { required: true, message: '生长阶段不能为空', trigger: 'blur' }
        ],
        stockQuantity: [
          { required: true, message: '存栏量不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getFarmInstitutionList()
    this.getBreedingProductList()
  },
  methods: {
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    
    // 获取列表数据
    getList() {
      this.tableLoading = true
      const requestData = {
        page: this.searchForm.page,
        limit: this.searchForm.limit,
        keywords: this.searchForm.keywords,
        farmName: this.searchForm.farmName,
        breedName: this.searchForm.breedName,
        dateLimit: this.searchForm.dateLimit ? this.searchForm.dateLimit.join(' - ') : ''
      }
      
      pageListApi(requestData).then(response => {
        console.log('养殖品种类型API响应:', response)
        this.tableData = response.records || []
        this.total = response.total || 0
        this.tableLoading = false
        console.log('处理后的表格数据:', this.tableData)
      }).catch((error) => {
        console.error('获取养殖品种类型列表失败:', error)
        this.tableData = []
        this.total = 0
        this.tableLoading = false
      })
    },
    
    // 获取养殖机构列表
    getFarmInstitutionList() {
      farmInstitutionApi.getAllList().then(response => {
        console.log('养殖机构列表响应:', response)
        this.farmInstitutionList = response || []
      }).catch(error => {
        console.error('获取养殖机构列表失败:', error)
        this.farmInstitutionList = []
      })
    },

    // 获取品种列表
    getBreedingProductList() {
      getBreedingProductOptionsApi().then(response => {
        console.log('品种列表响应:', response)
        this.breedingProductList = response || []
      }).catch(error => {
        console.error('获取品种列表失败:', error)
        this.breedingProductList = []
      })
    },
    
    // 搜索
    handleSearch() {
      this.searchForm.page = 1
      this.getList()
    },
    
    // 重置搜索
    handleReset() {
      this.searchForm = {
        keywords: '',
        farmName: '',
        breedName: '',
        dateLimit: null,
        page: 1,
        limit: 10
      }
      this.getList()
    },
    
    // 排序
    handleSortChange({ column, prop, order }) {
      // 这里可以实现排序逻辑
      console.log('排序', column, prop, order)
    },
    
    // 新增
    handleAdd() {
      this.dialogTitle = '新增养殖品种类型'
      this.dialogVisible = true
      this.dataForm = {
        id: '',
        farmCode: '',
        farmName: '',
        farmId: '',
        breedName: '',
        breedId: '',
        breedType: '',
        stockQuantity: 0,
        growthStage: ''
      }
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    
    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑养殖品种类型'
      this.dialogVisible = true
      this.dataForm = {
        id: row.id,
        farmCode: row.farmCode || '',
        farmName: row.farmName || '',
        farmId: row.farmId || '',
        breedName: row.breedName || '',
        breedId: row.breedId || '',
        breedType: row.breedType || '',
        stockQuantity: row.stockQuantity || 0,
        growthStage: row.growthStage || ''
      }
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该养殖品种类型吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteApi(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    },
    
    // 养殖场变更处理
    handleFarmChange(farmCode) {
      if (farmCode) {
        const selectedFarm = this.farmInstitutionList.find(farm => farm.farmCode === farmCode)
        if (selectedFarm) {
          this.dataForm.farmName = selectedFarm.farmName
          this.dataForm.farmId = selectedFarm.id ? selectedFarm.id.toString() : ''
        }
      } else {
        this.dataForm.farmName = ''
        this.dataForm.farmId = ''
      }
    },

    // 品种变更处理
    handleBreedChange(breedName) {
      if (breedName) {
        const selectedBreed = this.breedingProductList.find(breed => breed.name === breedName)
        if (selectedBreed) {
          this.dataForm.breedId = selectedBreed.id
          // 注意：这里不自动填充品种类型，因为养殖品种表中没有这个字段
          // 品种类型需要用户手动输入或从其他地方获取
        }
      } else {
        this.dataForm.breedId = ''
      }
    },


    
    // 保存
    handleSave() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const api = this.dataForm.id ? editApi : addApi
          api(this.dataForm).then(() => {
            this.$message.success(this.dataForm.id ? '编辑成功' : '新增成功')
            this.dialogVisible = false
            this.getList()
          })
        }
      })
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.searchForm.page = 1
      this.getList()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getList()
    }
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  min-height: auto;
  height: auto;
}

.filter-container {
  padding: 20px;
  background: #fff;
  margin-bottom: 20px;
}

.table-tools {
  padding: 10px 20px;
  background: #fff;
  margin-bottom: 20px;
}

.pagination-container {
  padding: 20px;
  text-align: right;
  background: #fff;
  margin-bottom: 0;
}

.stock-quantity {
  font-weight: bold;
  color: #409EFF;
}

/* 确保表格正常布局 */
.el-table {
  width: 100% !important;
  min-height: auto;
}

/* 移除多余的空白 */
.el-table .el-table__empty-block {
  min-height: 60px;
}

/* 确保页面内容不会产生多余高度 */
.el-main {
  min-height: auto !important;
  height: auto !important;
}


</style> 