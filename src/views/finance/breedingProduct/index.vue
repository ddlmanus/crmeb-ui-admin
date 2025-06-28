<template>
  <div class="app-container breeding-product-page">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keywords"
            placeholder="品种名称、编号"
            style="width: 200px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="品种编号">
          <el-input
            v-model="searchForm.code"
            placeholder="品种编号"
            style="width: 150px;"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
                  <el-form-item label="品种名称">
            <el-input
              v-model="searchForm.name"
              placeholder="品种名称"
              style="width: 150px;"
              clearable
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>
          <el-form-item label="存栏量">
            <el-input-number
              v-model="searchForm.stockQuantity"
              placeholder="存栏量（只）"
              style="width: 140px;"
              :min="0"
              :max="999999"
              :precision="0"
              controls-position="right"
              clearable
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
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增品种</el-button>
      <el-button type="success" icon="el-icon-refresh-right" @click="handleSyncAll" :loading="syncAllLoading">
        同步所有品种
      </el-button>
      <el-button type="warning" icon="el-icon-download" @click="showSyncDialog">
        同步指定养殖场
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      border
      style="width: 100%"
      @sort-change="handleSortChange"
      element-loading-text="正在加载养殖品种数据..."
      element-loading-spinner="el-icon-loading"
      empty-text="暂无数据"
    >
      <el-table-column prop="farmCode" label="养殖场编码" min-width="120" />
      <el-table-column prop="farmName" label="养殖场名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="code" label="品种编号" min-width="120" sortable="custom" />
      <el-table-column prop="name" label="品种名称" min-width="150" sortable="custom" />
      <el-table-column prop="splitSpecies" label="品种编码" min-width="120" />
      <el-table-column prop="stockQuantity" label="存栏量" min-width="100" sortable="custom">
        <template slot-scope="scope">
          <el-tag :type="getStockQuantityTagType(scope.row.stockQuantity)" size="small">
            {{ scope.row.stockQuantity || 0 }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" min-width="160" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateTimeFormat }}
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
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="dataForm"
        :rules="dataRules"
        label-width="100px"
      >
        <el-form-item label="选择所属机构" prop="farmInstitutionId">
          <el-select 
            v-model="dataForm.farmInstitutionId" 
            placeholder="请选择所属机构" 
            style="width: 100%;"
            @change="handleFarmInstitutionChange"
          >
            <el-option
              v-for="item in farmInstitutionOptions"
              :key="item.id"
              :label="`${item.orgName}(${item.orgCode})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品种编号" prop="code">
          <el-input v-model="dataForm.code" placeholder="请输入品种编号" />
        </el-form-item>
        <el-form-item label="品种名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="请输入品种名称" />
        </el-form-item>
        <el-form-item label="品种编码" prop="splitSpecies">
          <el-input v-model="dataForm.splitSpecies" placeholder="请输入品种编码" />
        </el-form-item>
        <el-form-item label="存栏量" prop="stockQuantity">
          <el-input-number
            v-model="dataForm.stockQuantity"
            :min="0"
            :max="999999"
            :precision="0"
            placeholder="请输入存栏量（只）"
            style="width: 100%;"
            controls-position="right"
          >
            <template slot="prepend">只数</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="dataForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>

    <!-- 同步指定养殖场对话框 -->
    <el-dialog
      title="同步指定养殖场品种"
      :visible.sync="syncDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="syncForm"
        :model="syncForm"
        :rules="syncRules"
        label-width="100px"
      >
        <el-form-item label="选择所属机构" prop="farmInstitutionId">
          <el-select 
            v-model="syncForm.farmInstitutionId" 
            placeholder="请选择要同步的所属机构" 
            style="width: 100%;"
            @change="handleSyncFarmChange"
          >
            <el-option
              v-for="item in farmInstitutionOptions"
              :key="item.id"
              :label="`${item.orgName}(${item.orgCode})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="养殖场编码">
          <el-input v-model="syncForm.farmCode" readonly placeholder="选择所属机构后自动填充" />
        </el-form-item>
        <el-form-item label="养殖场名称">
          <el-input v-model="syncForm.farmName" readonly placeholder="选择所属机构后自动填充" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="syncDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSyncByFarmCode" :loading="syncSingleLoading">
          开始同步
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageListApi, addApi, editApi, deleteApi, checkCodeApi, getOrganizationOptionsApi, syncAllBreedingProductsApi, syncBreedingProductsByFarmCodeApi } from '@/api/breedingProduct'

export default {
  name: 'BreedingProduct',
  data() {
    // 品种编号验证
    const validateCode = (rule, value, callback) => {
      if (value && value.length > 0) {
        checkCodeApi(value, this.dataForm.id).then(response => {
          console.log('验证编号API响应:', response)
          if (response) {
            callback(new Error('品种编号已存在'))
          } else {
            callback()
          }
        }).catch(() => {
          callback()
        })
      } else {
        callback()
      }
    }

    return {
      // 搜索表单
      searchForm: {
        keywords: '',
        code: '',
        name: '',
        stockQuantity: null,
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
      dataForm: {
        id: '',
        farmInstitutionId: '',
        farmCode: '',
        farmName: '',
        code: '',
        name: '',
        splitSpecies: '',
        stockQuantity: 0,
        remark: ''
      },
      // 养殖机构选项
      farmInstitutionOptions: [],
      // 表单验证规则
      dataRules: {
        farmInstitutionId: [
          { required: true, message: '请选择所属机构', trigger: 'change' }
        ],
        code: [
          { required: true, message: '品种编号不能为空', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '品种名称不能为空', trigger: 'blur' }
        ],
        stockQuantity: [
          { required: true, message: '存栏量不能为空', trigger: 'blur' },
          { type: 'number', min: 0, message: '存栏量不能小于0', trigger: 'blur' }
        ]
      },
      // 同步相关
      syncAllLoading: false,
      syncSingleLoading: false,
      syncDialogVisible: false,
      syncForm: {
        farmInstitutionId: '',
        farmCode: '',
        farmName: ''
      },
      syncRules: {
        farmInstitutionId: [
          { required: true, message: '请选择要同步的所属机构', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    // 立即显示loading状态
    this.tableLoading = true
    
    // 使用 setTimeout 确保页面先渲染，然后再加载数据
    setTimeout(() => {
      this.getList()
    }, 100)
    
    // 异步加载机构选项，不阻塞主要数据
    setTimeout(() => {
      this.getFarmInstitutionOptions()
    }, 200)
  },
  mounted() {
    // 添加页面初始化提示
    console.log('养殖品种管理页面已挂载')
  },
  methods: {
    // 获取存栏量标签类型
    getStockQuantityTagType(stockQuantity) {
      const quantity = stockQuantity || 0
      if (quantity === 0) {
        return 'info'
      } else if (quantity < 100) {
        return 'warning'
      } else if (quantity < 500) {
        return 'primary'
      } else {
        return 'success'
      }
    },
    // 获取列表数据
    async getList() {
      try {
        this.tableLoading = true
        const requestData = {
          page: this.searchForm.page,
          limit: this.searchForm.limit,
          keywords: this.searchForm.keywords,
          code: this.searchForm.code,
          name: this.searchForm.name,
          dateLimit: this.searchForm.dateLimit ? this.searchForm.dateLimit.join(' - ') : ''
        }
        
        console.log('正在请求养殖品种数据...', requestData)
        const response = await pageListApi(requestData)
        console.log('养殖品种API响应:', response)
        
        // 处理CommonPage结构
        if (response && typeof response === 'object') {
          // CommonPage结构使用list字段存储数据，total字段存储总数
          this.tableData = response.list || []
          this.total = response.total || 0
        } else {
          // 如果有其他结构
          this.tableData = []
          this.total = 0
        }
        
        console.log('数据加载完成，共', this.total, '条记录')
      } catch (error) {
        console.error('获取养殖品种列表失败:', error)
        this.$message.error('数据加载失败，请稍后重试')
        this.tableData = []
        this.total = 0
      } finally {
        this.tableLoading = false
      }
    },

    // 获取所属机构选项
    async getFarmInstitutionOptions() {
      try {
        console.log('正在加载机构选项...')
        const response = await getOrganizationOptionsApi()
        console.log('所属机构选项API响应:', response)
        this.farmInstitutionOptions = response || []
        console.log('机构选项加载完成，共', this.farmInstitutionOptions.length, '个选项')
      } catch (error) {
        console.error('获取所属机构选项失败:', error)
        this.farmInstitutionOptions = []
      }
    },

    // 所属机构选择改变
    handleFarmInstitutionChange(institutionId) {
      const selectedInstitution = this.farmInstitutionOptions.find(item => item.id === institutionId)
      if (selectedInstitution) {
        this.dataForm.farmCode = selectedInstitution.orgCode
        this.dataForm.farmName = selectedInstitution.orgName
      }
    },

    // 同步表单中的所属机构选择改变
    handleSyncFarmChange(institutionId) {
      const selectedInstitution = this.farmInstitutionOptions.find(item => item.id === institutionId)
      if (selectedInstitution) {
        this.syncForm.farmCode = selectedInstitution.orgCode
        this.syncForm.farmName = selectedInstitution.orgName
      }
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
        code: '',
        name: '',
        stockQuantity: null,
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
      this.dialogTitle = '新增养殖品种'
      this.dialogVisible = true
      this.dataForm = {
        id: '',
        farmInstitutionId: '',
        farmCode: '',
        farmName: '',
        code: '',
        name: '',
        splitSpecies: '',
        stockQuantity: 0,
        remark: ''
      }
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    
    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑养殖品种'
      this.dialogVisible = true
      
      // 根据farmCode查找对应的机构ID
      const farmInstitution = this.farmInstitutionOptions.find(item => item.orgCode === row.farmCode)
      
      this.dataForm = {
        id: row.id,
        farmInstitutionId: farmInstitution ? farmInstitution.id : '',
        farmCode: row.farmCode || '',
        farmName: row.farmName || '',
        code: row.code,
        name: row.name,
        splitSpecies: row.splitSpecies || '',
        stockQuantity: row.stockQuantity || 0,
        remark: row.remark || ''
      }
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该养殖品种吗？', '提示', {
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
    
    // 保存
    handleSave() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          const api = this.dataForm.id ? editApi : addApi
          const saveData = {
            id: this.dataForm.id,
            farmCode: this.dataForm.farmCode,
            farmName: this.dataForm.farmName,
            code: this.dataForm.code,
            name: this.dataForm.name,
            splitSpecies: this.dataForm.splitSpecies,
            stockQuantity: this.dataForm.stockQuantity,
            remark: this.dataForm.remark
          }
          api(saveData).then(() => {
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
    },

    // 同步所有品种
    handleSyncAll() {
      this.$confirm('确定要同步所有养殖场的品种数据吗？这可能需要一些时间。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.syncAllLoading = true
        syncAllBreedingProductsApi().then(response => {
          this.$message.success(response || '同步任务已启动，请查看日志了解同步进度')
          this.syncAllLoading = false
          // 延迟一段时间后刷新列表
          setTimeout(() => {
            this.getList()
          }, 3000)
        }).catch((error) => {
          console.error('同步所有品种失败:', error)
          this.$message.error('同步失败：' + (error.message || '请检查网络连接或查看日志'))
          this.syncAllLoading = false
        })
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 显示同步指定养殖场对话框
    showSyncDialog() {
      this.syncDialogVisible = true
      this.syncForm = {
        farmInstitutionId: '',
        farmCode: '',
        farmName: ''
      }
      this.$nextTick(() => {
        this.$refs.syncForm && this.$refs.syncForm.clearValidate()
      })
    },

    // 同步指定养殖场
    handleSyncByFarmCode() {
      this.$refs.syncForm.validate(valid => {
        if (valid) {
          this.$confirm(`确定要同步养殖场"${this.syncForm.farmName}"的品种数据吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }).then(() => {
            this.syncSingleLoading = true
            syncBreedingProductsByFarmCodeApi(this.syncForm.farmCode).then(response => {
              this.$message.success(response || '同步完成，请查看日志了解详细结果')
              this.syncSingleLoading = false
              this.syncDialogVisible = false
              // 刷新列表
              this.getList()
            }).catch((error) => {
              console.error('同步指定养殖场品种失败:', error)
              this.$message.error('同步失败：' + (error.message || '请检查网络连接或查看日志'))
              this.syncSingleLoading = false
            })
          }).catch(() => {
            // 用户取消操作
          })
        }
      })
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
  /* 立即显示容器，避免白屏 */
  opacity: 1;
  visibility: visible;
  background: #f0f2f5;
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

/* 同步按钮样式 */
.table-tools .el-button {
  margin-right: 10px;
}

.table-tools .el-button:last-child {
  margin-right: 0;
}

/* 同步对话框样式 */
.sync-dialog .el-form-item {
  margin-bottom: 20px;
}

.sync-dialog .el-input[readonly] {
  background-color: #f5f7fa;
}

/* 加载状态优化 */
.el-button.is-loading {
  pointer-events: none;
}

/* 页面初始化骨架屏效果 */
.breeding-product-page {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表格加载状态优化 */
.el-table .el-table__empty-text {
  color: #909399;
  font-size: 14px;
}

/* 立即显示搜索区域和按钮区域 */
.filter-container,
.table-tools {
  opacity: 1;
  visibility: visible;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}
</style> 